import {randomBytes} from "node:crypto";
import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {config} from "dotenv";
import bcrypt from "bcryptjs";
import {PrismaClient} from "@prisma/client";

config({path: ".env"});

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const RELEVANT_ACTIONS = [
  "ADD_JUDGE",
  "MAP_TEAM_TO_JUDGE",
  "REMOVE_TEAM_JUDGE_MAPPING",
  "SUBMIT_TEAM_SCORE",
  "REMOVE_JUDGE",
];
const SCORE_WEIGHTS = {
  innovation: 25,
  technical: 30,
  presentation: 15,
  feasibility: 15,
  impact: 15,
};

if (process.argv.includes("--help")) {
  console.log(`Usage:
  node scripts/restore-removed-judges.js          # dry run
  node scripts/restore-removed-judges.js --apply  # back up affected rows and apply

Optional environment variables (JSON values use historical judge/log IDs):
  ONLY_JUDGE_IDS=id1,id2
  RECOVERY_SINCE=2026-09-12T06:49:00Z
  RECOVERY_UNTIL=2026-09-12T06:51:00Z
  REMOVE_BATCH_GAP_MINUTES=5
  INCLUDE_UNASSIGNED_JUDGES=true
  JUDGE_ID_MAP='{"oldJudgeId":"existingJudgeId"}'
  JUDGE_NAME_MAP='{"oldJudgeId":"Judge Name"}'
  SCORE_OWNER_MAP='{"activityLogId":"oldJudgeId"}'
  IGNORE_ACTIVITY_LOG_IDS=id1,id2`);
  process.exit(0);
}

function readJsonEnvironment(name, fallback = {}) {
  const value = process.env[name];
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${name} must contain valid JSON: ${error.message}`);
  }
}

function parsePayload(payload) {
  let parsed = payload;

  for (let attempt = 0; attempt < 2 && typeof parsed === "string"; attempt += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
}

function extractRemovedJudgeId(details) {
  const match = details?.match(/\/judges\/([^/?\s]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

function extractRemovedMapping(details) {
  const match = details?.match(/\/team-judge-mappings\/([^/?\s]+)\/([^/?\s]+)/i);
  if (!match) return null;

  return {
    teamId: decodeURIComponent(match[1]),
    judgeId: decodeURIComponent(match[2]),
  };
}

function normalizeUsername(name) {
  return name
    .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?)\s+/i, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function cuidTimestamp(id) {
  if (!/^c[a-z0-9]{24}$/i.test(id)) return null;
  const timestamp = Number.parseInt(id.slice(1, 9), 36);
  return Number.isSafeInteger(timestamp) ? timestamp : null;
}

function readDateEnvironment(name) {
  const value = process.env[name];
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${name} must be a valid ISO-8601 date.`);
  }
  return date;
}

function scoreFromLog(log) {
  const payload = parsePayload(log.payload);
  const scores = payload?.scores;
  const teamId = payload?.teamId;
  const round = payload?.round ?? 1;

  if (typeof teamId !== "string" || !Number.isInteger(round) || round < 1 || !scores) {
    return null;
  }

  const normalizedScores = {};
  for (const field of Object.keys(SCORE_WEIGHTS)) {
    const value = Number(scores[field]);
    if (!Number.isFinite(value)) return null;
    normalizedScores[field] = value;
  }

  const totalScore = Number(
    Object.entries(SCORE_WEIGHTS)
      .reduce((total, [field, weight]) => total + (normalizedScores[field] * weight) / 100, 0)
      .toFixed(1),
  );

  return {
    logId: log.id,
    userId: log.userId,
    createdAt: log.createdAt,
    teamId,
    round,
    scores: {
      ...normalizedScores,
      feedback: typeof scores.feedback === "string" ? scores.feedback : null,
      totalScore,
    },
  };
}

function inferHistoricalNames(logs, liveJudges, historicalJudgeIds) {
  const names = new Map(liveJudges.map((judge) => [judge.id, judge.name]));
  const addEvents = logs
    .filter((log) => log.action === "ADD_JUDGE")
    .map((log) => ({log, name: parsePayload(log.payload)?.name}))
    .filter((entry) => typeof entry.name === "string" && entry.name.trim())
    .map((entry) => ({...entry, name: entry.name.trim()}));
  const usedAddLogIds = new Set();

  for (const judgeId of historicalJudgeIds) {
    if (names.has(judgeId)) continue;
    const createdAt = cuidTimestamp(judgeId);
    if (createdAt === null) continue;

    const match = addEvents
      .filter((entry) => {
        const delay = createdAt - entry.log.createdAt.getTime();
        return !usedAddLogIds.has(entry.log.id) && delay >= 0 && delay <= 120_000;
      })
      .sort(
        (left, right) =>
          createdAt - left.log.createdAt.getTime() - (createdAt - right.log.createdAt.getTime()),
      )[0];

    if (match) {
      names.set(judgeId, match.name);
      usedAddLogIds.add(match.log.id);
    }
  }

  return names;
}

function selectRemovalLogs(logs, onlyJudgeIds, recoverySince, recoveryUntil, batchGapMinutes) {
  const removalLogs = logs.filter(
    (log) => log.action === "REMOVE_JUDGE" && extractRemovedJudgeId(log.details),
  );

  if (onlyJudgeIds.size > 0) {
    return removalLogs.filter((log) => onlyJudgeIds.has(extractRemovedJudgeId(log.details)));
  }

  if (recoverySince || recoveryUntil) {
    return removalLogs.filter(
      (log) =>
        (!recoverySince || log.createdAt >= recoverySince) &&
        (!recoveryUntil || log.createdAt <= recoveryUntil),
    );
  }

  if (removalLogs.length === 0) return [];
  const selected = [removalLogs.at(-1)];
  const maximumGap = batchGapMinutes * 60_000;

  for (let index = removalLogs.length - 2; index >= 0; index -= 1) {
    const nextLog = selected[0];
    const currentLog = removalLogs[index];
    if (nextLog.createdAt.getTime() - currentLog.createdAt.getTime() > maximumGap) break;
    selected.unshift(currentLog);
  }

  return selected;
}

function getRemovalPlans(logs, selectedRemovalLogs, includeUnassignedJudges) {
  const plans = new Map();
  const selectedLogIds = new Set(selectedRemovalLogs.map((log) => log.id));

  for (const [logOrder, log] of logs.entries()) {
    if (!selectedLogIds.has(log.id)) continue;
    const judgeId = extractRemovedJudgeId(log.details);
    if (!judgeId || plans.has(judgeId)) continue;

    plans.set(judgeId, {
      oldJudgeId: judgeId,
      removeLogId: log.id,
      removeLogOrder: logOrder,
      removedAt: log.createdAt,
      mappings: new Map(),
      scores: new Map(),
    });
  }

  for (const plan of plans.values()) {
    for (const [logOrder, log] of logs.entries()) {
      if (logOrder > plan.removeLogOrder) break;

      if (log.action === "MAP_TEAM_TO_JUDGE") {
        const payload = parsePayload(log.payload);
        if (payload?.judgeId === plan.oldJudgeId && typeof payload.teamId === "string") {
          plan.mappings.set(payload.teamId, {teamId: payload.teamId, mappedAt: log.createdAt, logId: log.id});
        }
      }

      if (log.action === "REMOVE_TEAM_JUDGE_MAPPING") {
        const mapping = extractRemovedMapping(log.details);
        if (mapping?.judgeId === plan.oldJudgeId) {
          plan.mappings.delete(mapping.teamId);
        }
      }
    }
  }

  if (!includeUnassignedJudges) {
    for (const [judgeId, plan] of plans) {
      if (plan.mappings.size === 0) plans.delete(judgeId);
    }
  }

  return plans;
}

function selectScoreOwners(logs, plans, scoreOwnerOverrides, ignoredLogIds, liveJudgeByUserId) {
  const errors = [];
  const warnings = [];

  for (const [logOrder, log] of logs.entries()) {
    if (log.action !== "SUBMIT_TEAM_SCORE" || ignoredLogIds.has(log.id)) continue;
    const score = scoreFromLog(log);

    if (!score) {
      warnings.push(`Ignored malformed SUBMIT_TEAM_SCORE log ${log.id}.`);
      continue;
    }

    if (score.userId && liveJudgeByUserId.has(score.userId)) {
      continue;
    }

    const override = scoreOwnerOverrides[log.id];
    score.logOrder = logOrder;
    const candidates = [...plans.values()].filter(
      (plan) => plan.removeLogOrder >= logOrder && plan.mappings.has(score.teamId),
    );

    let owner = null;
    if (override) {
      owner = plans.get(override);
      if (!owner || !owner.mappings.has(score.teamId) || owner.removeLogOrder < logOrder) {
        errors.push(`SCORE_OWNER_MAP assigns log ${log.id} to incompatible judge ${override}.`);
        continue;
      }
    } else if (candidates.length === 1) {
      [owner] = candidates;
    } else if (candidates.length > 1) {
      errors.push(
        `Score log ${log.id} for team ${score.teamId} could belong to ${candidates
          .map((candidate) => candidate.oldJudgeId)
          .join(", ")}. Set SCORE_OWNER_MAP["${log.id}"].`,
      );
      continue;
    } else {
      continue;
    }

    const key = `${score.teamId}:${score.round}`;
    const previous = owner.scores.get(key);
    if (!previous || previous.logOrder < score.logOrder) {
      owner.scores.set(key, score);
    }
  }

  return {errors, warnings};
}

function resolveTargets(plans, historicalNames, liveJudges, allUsers, judgeIdMap, judgeNameMap) {
  const errors = [];
  const usedTargetIds = new Set();

  for (const plan of plans.values()) {
    const explicitTargetId = judgeIdMap[plan.oldJudgeId];
    const liveSameId = liveJudges.find((judge) => judge.id === plan.oldJudgeId);
    const historicalName = judgeNameMap[plan.oldJudgeId] ?? historicalNames.get(plan.oldJudgeId);
    let target = null;

    if (explicitTargetId) {
      target = liveJudges.find((judge) => judge.id === explicitTargetId);
      if (!target) {
        errors.push(`JUDGE_ID_MAP target ${explicitTargetId} does not exist for ${plan.oldJudgeId}.`);
        continue;
      }
    } else if (liveSameId) {
      target = liveSameId;
    } else if (historicalName) {
      const normalizedName = normalizeUsername(historicalName);
      const matches = liveJudges.filter(
        (judge) =>
          normalizeUsername(judge.name) === normalizedName || judge.user.username === normalizedName,
      );

      if (matches.length > 1) {
        errors.push(`Multiple live judges match historical name "${historicalName}" (${plan.oldJudgeId}).`);
        continue;
      }
      [target] = matches;
    }

    if (!target && !historicalName) {
      errors.push(
        `Cannot identify removed judge ${plan.oldJudgeId}. Set JUDGE_NAME_MAP["${plan.oldJudgeId}"].`,
      );
      continue;
    }

    if (target) {
      if (usedTargetIds.has(target.id)) {
        errors.push(`Live judge ${target.id} is the target for more than one removed judge.`);
        continue;
      }
      usedTargetIds.add(target.id);
      plan.targetJudgeId = target.id;
      plan.targetName = target.name;
      plan.createJudge = false;
      continue;
    }

    const username = normalizeUsername(historicalName);
    const conflictingUser = allUsers.find((user) => user.username === username);
    if (conflictingUser) {
      errors.push(
        `Username ${username} already exists without a reusable judge profile. Use JUDGE_ID_MAP for ${plan.oldJudgeId}.`,
      );
      continue;
    }

    plan.targetJudgeId = plan.oldJudgeId;
    plan.targetName = historicalName;
    plan.targetUsername = username;
    plan.createJudge = true;
  }

  return errors;
}

function summarize(plans) {
  return [...plans.values()].map((plan) => ({
    removedJudgeId: plan.oldJudgeId,
    targetJudgeId: plan.targetJudgeId,
    name: plan.targetName,
    action: plan.createJudge === true ? "CREATE" : plan.createJudge === false ? "REUSE" : "UNRESOLVED",
    removedAt: plan.removedAt.toISOString(),
    teams: plan.mappings.size,
    scores: plan.scores.size,
  }));
}

async function createBackup(plans) {
  const targetJudgeIds = [...new Set([...plans.values()].map((plan) => plan.targetJudgeId))];
  const [evaluations, teamScores] = await Promise.all([
    prisma.evaluation.findMany({where: {judgeId: {in: targetJudgeIds}}}),
    prisma.teamScore.findMany({where: {judgeId: {in: targetJudgeIds}}}),
  ]);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(process.cwd(), `removed-judge-recovery-backup-${timestamp}.json`);

  await writeFile(
    path,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        targets: summarize(plans),
        evaluations,
        teamScores,
      },
      null,
      2,
    ),
    {encoding: "utf8", flag: "wx"},
  );

  return path;
}

async function applyRecovery(plans) {
  const generatedPasswords = [];
  const preparedPlans = [];

  for (const plan of plans.values()) {
    if (!plan.createJudge) {
      preparedPlans.push(plan);
      continue;
    }

    const temporaryPassword = randomBytes(18).toString("base64url");
    preparedPlans.push({
      ...plan,
      temporaryPasswordHash: await bcrypt.hash(temporaryPassword, 12),
    });
    generatedPasswords.push({username: plan.targetUsername, temporaryPassword});
  }

  await prisma.$transaction(async (transaction) => {
    for (const plan of preparedPlans) {
      if (plan.createJudge) {
        const user = await transaction.user.create({
          data: {
            username: plan.targetUsername,
            password: plan.temporaryPasswordHash,
            role: "JUDGE",
          },
        });
        await transaction.judge.create({
          data: {
            id: plan.targetJudgeId,
            userId: user.id,
            name: plan.targetName,
          },
        });
      }

      for (const mapping of plan.mappings.values()) {
        const score = plan.scores.get(`${mapping.teamId}:1`);
        await transaction.evaluation.upsert({
          where: {
            teamId_judgeId_round: {
              teamId: mapping.teamId,
              judgeId: plan.targetJudgeId,
              round: 1,
            },
          },
          update: score ? {status: "COMPLETED", updatedAt: score.createdAt} : {},
          create: {
            teamId: mapping.teamId,
            judgeId: plan.targetJudgeId,
            round: 1,
            status: score ? "COMPLETED" : "PENDING",
            createdAt: mapping.mappedAt,
            updatedAt: score?.createdAt ?? mapping.mappedAt,
          },
        });
      }

      for (const score of plan.scores.values()) {
        await transaction.evaluation.upsert({
          where: {
            teamId_judgeId_round: {
              teamId: score.teamId,
              judgeId: plan.targetJudgeId,
              round: score.round,
            },
          },
          update: {status: "COMPLETED", updatedAt: score.createdAt},
          create: {
            teamId: score.teamId,
            judgeId: plan.targetJudgeId,
            round: score.round,
            status: "COMPLETED",
            createdAt: score.createdAt,
            updatedAt: score.createdAt,
          },
        });

        await transaction.teamScore.upsert({
          where: {
            teamId_judgeId_round: {
              teamId: score.teamId,
              judgeId: plan.targetJudgeId,
              round: score.round,
            },
          },
          update: {
            ...score.scores,
            updatedAt: score.createdAt,
          },
          create: {
            teamId: score.teamId,
            judgeId: plan.targetJudgeId,
            round: score.round,
            ...score.scores,
            createdAt: score.createdAt,
            updatedAt: score.createdAt,
          },
        });
      }
    }
  }, {maxWait: 10_000, timeout: 120_000});

  return generatedPasswords;
}

async function main() {
  const judgeIdMap = readJsonEnvironment("JUDGE_ID_MAP");
  const judgeNameMap = readJsonEnvironment("JUDGE_NAME_MAP");
  const scoreOwnerOverrides = readJsonEnvironment("SCORE_OWNER_MAP");
  const onlyJudgeIds = new Set(
    (process.env.ONLY_JUDGE_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const recoverySince = readDateEnvironment("RECOVERY_SINCE");
  const recoveryUntil = readDateEnvironment("RECOVERY_UNTIL");
  const batchGapMinutes = Number(process.env.REMOVE_BATCH_GAP_MINUTES ?? 5);
  if (!Number.isFinite(batchGapMinutes) || batchGapMinutes <= 0) {
    throw new Error("REMOVE_BATCH_GAP_MINUTES must be a positive number.");
  }
  const includeUnassignedJudges = process.env.INCLUDE_UNASSIGNED_JUDGES === "true";
  const ignoredLogIds = new Set(
    (process.env.IGNORE_ACTIVITY_LOG_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  const [logs, liveJudges, allUsers, teams] = await Promise.all([
    prisma.activityLog.findMany({
      where: {action: {in: RELEVANT_ACTIONS}},
      orderBy: [{createdAt: "asc"}, {id: "asc"}],
    }),
    prisma.judge.findMany({include: {user: {select: {id: true, username: true}}}}),
    prisma.user.findMany({select: {id: true, username: true}}),
    prisma.team.findMany({select: {id: true, name: true, teamId: true}}),
  ]);

  const selectedRemovalLogs = selectRemovalLogs(
    logs,
    onlyJudgeIds,
    recoverySince,
    recoveryUntil,
    batchGapMinutes,
  );
  const plans = getRemovalPlans(logs, selectedRemovalLogs, includeUnassignedJudges);
  if (plans.size === 0) {
    throw new Error("No matching REMOVE_JUDGE activity logs with team mappings were found.");
  }

  console.log(
    `Selected ${selectedRemovalLogs.length} REMOVE_JUDGE logs from ${selectedRemovalLogs[0].createdAt.toISOString()} to ${selectedRemovalLogs.at(-1).createdAt.toISOString()}.`,
  );
  const historicalNames = inferHistoricalNames(logs, liveJudges, plans.keys());
  const errors = resolveTargets(
    plans,
    historicalNames,
    liveJudges,
    allUsers,
    judgeIdMap,
    judgeNameMap,
  );
  const liveJudgeByUserId = new Map(liveJudges.map((judge) => [judge.userId, judge]));
  const scoreSelection = selectScoreOwners(
    logs,
    plans,
    scoreOwnerOverrides,
    ignoredLogIds,
    liveJudgeByUserId,
  );
  errors.push(...scoreSelection.errors);

  const teamIds = new Set(teams.map((team) => team.id));
  for (const plan of plans.values()) {
    for (const mapping of plan.mappings.values()) {
      if (!teamIds.has(mapping.teamId)) {
        errors.push(
          `Mapped team ${mapping.teamId} for removed judge ${plan.oldJudgeId} no longer exists.`,
        );
      }
    }
  }

  console.table(summarize(plans));
  for (const warning of scoreSelection.warnings) console.warn(`WARNING: ${warning}`);

  if (errors.length > 0) {
    console.error("\nRecovery was not applied because the history is ambiguous:");
    for (const error of errors) console.error(`- ${error}`);
    console.error("\nResolve the reported entries with JUDGE_ID_MAP, JUDGE_NAME_MAP, or SCORE_OWNER_MAP, then rerun the dry run.");
    process.exitCode = 2;
    return;
  }

  if (!APPLY) {
    console.log("\nDry run only. No rows were changed.");
    console.log("Rerun with --apply after reviewing this plan.");
    return;
  }

  const backupPath = await createBackup(plans);
  console.log(`Backup written to ${backupPath}`);

  const generatedPasswords = await applyRecovery(plans);
  console.log("\nRecovery completed. This script does not write to ActivityLog.");
  if (generatedPasswords.length > 0) {
    console.log("Temporary credentials for recreated judges (store these securely and reset them):");
    console.table(generatedPasswords);
  }
}

main()
  .catch((error) => {
    console.error("Recovery failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });