/**
 * HackX 4.0 Tournament End-to-End Simulation Script
 * Demonstrates: Adding teams -> Checkpoints -> Problem Statements -> Submissions ->
 * Round 1 Judging -> Round 2 Promotion -> Round 2 Scoring ->
 * Round 3 Selection -> Snake Auto-Assignment -> Finals Scoring -> Championship Leaderboard
 */

interface Criterion {
  id: string;
  weight: number;
}

const scoringCriteria: Criterion[] = [
  { id: "innovation", weight: 25 },
  { id: "technical", weight: 30 },
  { id: "presentation", weight: 15 },
  { id: "feasibility", weight: 15 },
  { id: "impact", weight: 15 },
];

function calculateWeightedScore(scores: Record<string, number>): number {
  let total = 0;
  for (const crit of scoringCriteria) {
    total += (scores[crit.id] * crit.weight) / 100;
  }
  return parseFloat(total.toFixed(1));
}

async function runE2ESimulation() {
  console.log("\n=======================================================");
  console.log("🏆 HACKX 4.0 END-TO-END TOURNAMENT SIMULATION");
  console.log("=======================================================\n");

  // Phase 1: Team Registration
  console.log("📍 [STAGE 0] Registering 6 Teams & Enrolling Participants...");
  const teams = [
    { id: "t1", teamId: "HX-101", name: "CyberKnights", leader: "Aarav Sharma" },
    { id: "t2", teamId: "HX-102", name: "QuantumCore", leader: "Diya Patel" },
    { id: "t3", teamId: "HX-103", name: "NeuralSync", leader: "Rohan Verma" },
    { id: "t4", teamId: "HX-104", name: "MatrixMind", leader: "Sneha Reddy" },
    { id: "t5", teamId: "HX-105", name: "HeliosAI", leader: "Vikram Malhotra" },
    { id: "t6", teamId: "HX-106", name: "ApexDynasty", leader: "Ananya Iyer" },
  ];

  console.table(teams.map((t) => ({ ID: t.teamId, Name: t.name, Leader: t.leader, Status: "REGISTERED" })));

  // Phase 1: Checkpoints & Submissions
  console.log("\n📍 [ROUND 1 - STEP 1] Completing Checkpoint 1 (Attendance) & Checkpoint 2 (Credentials)...");
  teams.forEach((t) => {
    console.log(`  ✅ ${t.name}: Checkpoint 1 (Attendance: 2/2 Present) | Checkpoint 2 (User created, Room: AB1 001)`);
  });

  console.log("\n📍 [ROUND 1 - STEP 2] Problem Statement Selection & Submissions...");
  teams.forEach((t, i) => {
    const ps = i % 2 === 0 ? "AI Disaster Response" : "Decentralized Identity";
    console.log(`  🚀 ${t.name}: Selected "${ps}" -> Submitted GitHub (https://github.com/hackx/${t.name.toLowerCase()}) & Presentation`);
  });
  console.log("  All 6 teams status -> ROUND1_SUBMITTED");

  // Round 1 Scoring
  console.log("\n📍 [ROUND 1 - STEP 3] Round 1 Judging & Scoring (5 Weighted Criteria)...");
  const r1ScoresRaw: Record<string, Record<string, number>> = {
    t1: { innovation: 9.0, technical: 9.0, presentation: 8.0, feasibility: 8.0, impact: 9.0 },
    t2: { innovation: 8.0, technical: 8.0, presentation: 7.0, feasibility: 7.0, impact: 8.0 },
    t3: { innovation: 9.5, technical: 9.5, presentation: 9.0, feasibility: 9.0, impact: 9.5 },
    t4: { innovation: 7.0, technical: 7.0, presentation: 6.0, feasibility: 6.0, impact: 7.0 },
    t5: { innovation: 8.5, technical: 8.5, presentation: 8.0, feasibility: 8.0, impact: 8.5 },
    t6: { innovation: 6.0, technical: 6.0, presentation: 5.0, feasibility: 5.0, impact: 6.0 },
  };

  const r1Results = teams.map((t) => {
    const score = calculateWeightedScore(r1ScoresRaw[t.id]);
    return { ...t, r1Score: score };
  }).sort((a, b) => b.r1Score - a.r1Score);

  console.table(r1Results.map((t, rank) => ({
    Rank: rank + 1,
    Team: t.name,
    "Round 1 Score": t.r1Score,
    Evaluation: "COMPLETED",
  })));

  // Phase 2: Round 2 Promotion
  console.log("\n📍 [ROUND 2 - STEP 1] Promoting Top 4 Teams to Round 2 (Semi-Finals)...");
  const r2Teams = r1Results.slice(0, 4).map((t) => ({ ...t, status: "ROUND1_QUALIFIED" }));
  const eliminated = r1Results.slice(4).map((t) => t.name);
  console.log(`  Qualified for Round 2: ${r2Teams.map((t) => t.name).join(", ")}`);
  console.log(`  Eliminated from Round 1: ${eliminated.join(", ")}`);

  console.log("\n📍 [ROUND 2 - STEP 2] Allocating Round 2 Rooms & Judging...");
  const r2Rooms = [
    { name: "AB1-201", teams: [r2Teams[0].name, r2Teams[1].name] },
    { name: "AB1-202", teams: [r2Teams[2].name, r2Teams[3].name] },
  ];
  console.table(r2Rooms.map((r) => ({ Room: r.name, Teams: r.teams.join(", ") })));

  const r2ScoresRaw: Record<string, Record<string, number>> = {
    t3: { innovation: 9.5, technical: 10.0, presentation: 9.5, feasibility: 9.0, impact: 9.5 },
    t1: { innovation: 9.0, technical: 9.0, presentation: 8.5, feasibility: 8.5, impact: 9.0 },
    t5: { innovation: 8.5, technical: 8.5, presentation: 8.0, feasibility: 8.0, impact: 8.5 },
    t2: { innovation: 7.5, technical: 7.5, presentation: 7.0, feasibility: 7.0, impact: 7.5 },
  };

  const r2Results = r2Teams.map((t) => {
    const score = calculateWeightedScore(r2ScoresRaw[t.id]);
    return { ...t, r2Score: score };
  }).sort((a, b) => b.r2Score - a.r2Score);

  console.table(r2Results.map((t, rank) => ({
    Rank: rank + 1,
    Team: t.name,
    "Round 2 Score": t.r2Score,
    Status: "ROUND2_SUBMITTED",
  })));

  // Phase 3: Round 3 Selection & Snake Distribution
  console.log("\n📍 [ROUND 3 - STEP 1] Selecting Top 3 Finalists for Round 3 (Finals)...");
  const r3Finalists = r2Results.slice(0, 3).map((t) => ({ ...t, status: "ROUND2_QUALIFIED" }));
  console.log(`  Round 3 Finalists: ${r3Finalists.map((t) => t.name).join(", ")}`);

  console.log("\n📍 [ROUND 3 - STEP 2] Auto-Distributing Finalists across Meeting Rooms (Snake Algorithm)...");
  const meetingRooms = [
    { name: "Meeting Room 1", judge: "Dr. Alice Turing (Judge 1)", team: r3Finalists[0].name },
    { name: "Meeting Room 2", judge: "Prof. Bob Hopper (Judge 2)", team: r3Finalists[1].name },
    { name: "Meeting Room 3", judge: "Dr. Clara Shannon (Judge 3)", team: r3Finalists[2].name },
  ];
  console.table(meetingRooms);

  // Phase 4: Round 3 Finals Scoring
  console.log("\n📍 [ROUND 3 - STEP 3] Final Championship Pitch & Live Scoring...");
  const r3ScoresRaw: Record<string, Record<string, number>> = {
    t3: { innovation: 10.0, technical: 10.0, presentation: 10.0, feasibility: 9.5, impact: 10.0 }, // 9.9
    t1: { innovation: 9.0, technical: 9.5, presentation: 9.0, feasibility: 9.0, impact: 9.0 },      // 9.1
    t5: { innovation: 8.5, technical: 9.0, presentation: 8.5, feasibility: 8.5, impact: 9.0 },      // 8.7
  };

  const championship = r3Finalists.map((t) => {
    const score = calculateWeightedScore(r3ScoresRaw[t.id]);
    return { ...t, finalScore: score };
  }).sort((a, b) => b.finalScore - a.finalScore);

  console.log("\n=======================================================");
  console.log("🎉 HACKX 4.0 FINAL CHAMPIONSHIP LEADERBOARD");
  console.log("=======================================================");

  console.table(championship.map((t, idx) => {
    const medals = ["🥇 1st Place (Champion)", "🥈 2nd Place (Runner-up)", "🥉 3rd Place"];
    return {
      Position: medals[idx],
      Team: t.name,
      Leader: t.leader,
      "R1 Score": t.r1Score,
      "R2 Score": t.r2Score,
      "Final Score": t.finalScore,
    };
  }));

  console.log(`\n🏆 CONGRATULATIONS TO THE WINNER: ${championship[0].name} (Score: ${championship[0].finalScore}/10)!\n`);
}

runE2ESimulation().catch(console.error);
