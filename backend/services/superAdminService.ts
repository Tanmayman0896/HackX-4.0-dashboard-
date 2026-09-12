import {PrismaClient} from "@prisma/client";
import {hashPassword} from "../utils/password";
import {AppError} from "../utils/errors";
import type {LogFilter} from "../types";

const prisma = new PrismaClient();

const ROUND3_ROOM_NAMES = [
  "Meeting Room 1",
  "Meeting Room 2",
];
const ROUND3_ROOM_CAPACITY = 15;

interface Checkpoint1Data {
  teamId: string;
  wifi: boolean;
  participants: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    role?: "MEMBER" | "LEADER";
    isPresent: boolean;
    residence?: "inhouse" | "outhouse";
  }[];
}

interface Checkpoint2Data {
  teamId: string;
}

export class SuperAdminService {
  // User Management
  async getAllUsers() {
    return prisma.user.findMany({
      include: {
        participantTeam: {
          select: {id: true, name: true, teamId: true},
        },
        mentorProfile: {
          select: {id: true, expertise: true},
        },
        judgeProfile: {
          select: {id: true},
        },
      },
      orderBy: {createdAt: "desc"},
    });
  }

  async createUser(userData: {
    username: string
    password: string
    email?: string
    role: string
    expertise?: string[]
    floor?: string
  }) {
    const {username, password, email, role, expertise} = userData;

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: {username},
    });

    if (existingUser) {
      throw new Error("Username already exists");
    }

    const hashedPassword = await hashPassword(password);

    // Create user with role-specific profile
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role: role as any,
        ...(role === "MENTOR" && {
          mentorProfile: {
            create: {
              name: username,
              expertise: expertise || [],
            },
          },
        }),
        ...(role === "JUDGE" && {
          judgeProfile: {
            create: {
              name: username,
            },
          },
        }),
      },
      include: {
        mentorProfile: true,
        judgeProfile: true,
      },
    });

    const {password: _, ...userWithoutPassword} = user;
    return userWithoutPassword;
  }

  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: {id: userId},
    });

    if (!user) {
      throw new Error("User not found");
    }

    return prisma.user.update({
      where: {id: userId},
      data: {
        status: user.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
      },
    });
  }

  async deleteUser(userId: string) {
    // Check if user exists and get their role
    const user = await prisma.user.findUnique({
      where: {id: userId},
      include: {
        mentorProfile: true,
        judgeProfile: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Delete role-specific profiles first
    if (user.mentorProfile) {
      await prisma.mentor.delete({
        where: {userId},
      });
    }

    if (user.judgeProfile) {
      await prisma.judge.delete({
        where: {userId},
      });
    }

    // Delete the user
    return prisma.user.delete({
      where: {id: userId},
    });
  }

  // Problem Statement Management
  async getAllProblemStatements() {
    const psList = await prisma.problemStatement.findMany({
      include: {
        domain: true,
        teams: {
          select: {id: true, name: true, teamId: true},
        },
        _count: {
          select: {teams: true},
        },
      },
      orderBy: {createdAt: "desc"},
    });
    return psList.map((ps) => ({
      ...ps,
      selectedCount: ps._count.teams,
    }));
  }

  async createProblemStatement(data: {
    title: string
    description: string
    domainId: string
    deliverables?: string[]
  }) {
    // Frontend form data also carries a 'domain' name field for display
    // purposes; only pass the fields the Prisma create input accepts.
    return prisma.problemStatement.create({
      data: {
        title: data.title,
        description: data.description,
        domainId: data.domainId,
        deliverables: data.deliverables ?? [],
      },
      include: {
        domain: true,
      },
    });
  }

  async updateProblemStatement(
    id: string,
    data: {
      title: string;
      description: string;
      domainId: string;
      deliverables: string[];
    },
  ) {
    return prisma.problemStatement.update({
      where: {id},
      data: {
        title: data.title,
        description: data.description,
        domainId: data.domainId,
        deliverables: data.deliverables ?? [],
      },
      include: {
        domain: true,
      },
    });
  }

  async deleteProblemStatement(id: string) {
    // Check if any teams have selected this PS
    const teamsCount = await prisma.team.count({
      where: {problemStatementId: id},
    });

    if (teamsCount > 0) {
      throw new AppError("Cannot delete problem statement that has been selected by teams", 400);
    }

    const bookmarksCount = await prisma.pSBookmark.count({
      where: {problemStatementId: id},
    });
    if (bookmarksCount > 0) {
      await prisma.pSBookmark.deleteMany({where: {problemStatementId: id}});
    }

    return prisma.problemStatement.delete({
      where: {id},
    });
  }

  async toggleProblemStatementLock(locked: boolean) {
    await prisma.systemSettings.upsert({
      where: {key: "problem_statements_locked"},
      update: {value: locked.toString()},
      create: {
        key: "problem_statements_locked",
        value: locked.toString(),
        description: "Whether problem statement selection is locked",
      },
    });

    return {locked};
  }

  // Team Management
  async getAllTeams() {
    return prisma.team.findMany({
      include: {
        participants: {
          select: {id: true, name: true, email: true, residence: true},
        },
        problemStatement: {
          include: {domain: true},
        },
        evaluations: {
          include: {
            judge: {
              include: {
                user: {select: {username: true}},
              },
            },
          },
        },
        teamScores: {
          include: {
            judge: {
              include: {
                user: {select: {username: true}},
              },
            },
          },
        },
        submissions: true,
        round1Room: true,
        round2Room: true,
        checkpoints: {
          select: {checkpoint: true, status: true, completedAt: true, data: true},
        }
      },
      orderBy: {createdAt: "desc"},
    });
  }

  async getTeamDetails(teamId: string) {
    const team = await prisma.team.findUnique({
      where: {id: teamId},
      include: {
        participants: {
          select: {id: true, name: true, email: true},
        },
        problemStatement: {
          include: {domain: true},
        },
        evaluations: {
          include: {
            judge: {
              include: {
                user: {select: {username: true}},
              },
            },
          },
        },
        teamScores: {
          include: {
            judge: {
              include: {
                user: {select: {username: true}},
              },
            },
          },
        },
        submissions: true,
        checkpoints: true,
        mentorshipQueue: {
          include: {
            mentor: {
              include: {
                user: {select: {username: true}},
              },
            },
          },
        },
        round2Room: true,
      },
    });

    if (!team) {
      throw new Error("Team not found");
    }

    return team;
  }

  // System Settings
  async toggleMentorshipLock(locked: boolean) {
    await prisma.systemSettings.upsert({
      where: {key: "mentorship_locked"},
      update: {value: locked.toString()},
      create: {
        key: "mentorship_locked",
        value: locked.toString(),
        description: "Whether mentorship booking is locked",
      },
    });

    return {locked};
  }

  async toggleRound1Lock(locked: boolean) {
    await prisma.systemSettings.upsert({
      where: {key: "round1_locked"},
      update: {value: locked.toString()},
      create: {
        key: "round1_locked",
        value: locked.toString(),
        description: "Whether round 1 submissions are locked",
      },
    });

    return {locked};
  }

  async getSystemSettings() {
    const settings = await prisma.systemSettings.findMany();
    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  // Activity Logs
  async getActivityLogs(filters?: LogFilter) {
    const where: any = {};

    if (filters?.action && filters.action !== "all") {
      where.action = {contains: filters.action, mode: "insensitive"};
    }

    if (filters?.userId && filters.userId !== "all") {
      where.userId = filters.userId;
    }

    return prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {id: true, username: true, role: true},
        },
      },
      orderBy: {createdAt: "desc"},
      take: 1000, // Limit to prevent performance issues
    });
  }

  // Announcements
  async createAnnouncement(
    authorId: string,
    data: {
      title: string
      message: string
    },
  ) {
    return prisma.announcement.create({
      data: {
        ...data,
        authorId,
      },
      include: {
        author: {
          select: {username: true, role: true},
        },
      },
    });
  }

  async getAllAnnouncements() {
    return prisma.announcement.findMany({
      include: {
        author: {
          select: {username: true, role: true},
        },
      },
      orderBy: {createdAt: "desc"},
    });
  }

  // Team-Judge Mapping
  async getTeamJudgeMappings() {
    return prisma.evaluation.findMany({
      include: {
        team: {
          select: {id: true, name: true, teamId: true, problemStatement: {include: {domain: true}}},
        },
        judge: {
          include: {
            user: {select: {username: true}},
          },
        },
      },
    });
  }

  async mapTeamToJudge(teamId: string, judgeId: string) {
    // Check if mapping already exists
    const existingMapping = await prisma.evaluation.findUnique({
      where: {
        teamId_judgeId_round: {
          teamId,
          judgeId,
          round: 1,
        },
      },
    });

    if (existingMapping) {
      throw new Error("Team is already mapped to this judge");
    }

    return prisma.evaluation.create({
      data: {
        teamId,
        judgeId,
        round: 1,
      },
      include: {
        team: {select: {name: true, teamId: true}},
        judge: {
          include: {
            user: {select: {username: true}},
          },
        },
      },
    });
  }

  async removeTeamJudgeMapping(teamId: string, judgeId: string) {
    return prisma.evaluation.delete({
      where: {
        teamId_judgeId_round: {
          teamId,
          judgeId,
          round: 1,
        },
      },
    });
  }

  // Round 2 Management
  async promoteTeamsToRound2(teamIds: string[]) {
    return prisma.team.updateMany({
      where: {
        id: {in: teamIds},
      },
      data: {
        status: "ROUND1_QUALIFIED",
      },
    });
  }

  async getRound2Rooms() {
    return prisma.round2Room.findMany({
      orderBy: {name: "asc"},
      include: {
        teams: {
          select: {id: true, name: true, teamId: true},
        },
        judges: {
          select: {id: true, name: true},
        },
      },
    });
  }

  async createRound2Room(data: {
    name: string
    capacity?: number
    floor?: string
  }) {
    return prisma.round2Room.create({
      data,
    });
  }

  async assignJudgeToRoom(judgeId: string, roomId: string) {
    const judge = await prisma.judge.findUnique({where: {id: judgeId}});
    if (!judge) {
      throw new AppError("Judge not found", 404);
    }

    const room = await prisma.round2Room.findUnique({where: {id: roomId}});
    if (!room) {
      throw new AppError("Round 2 room not found", 404);
    }

    return prisma.$transaction(async (tx) => {
      await tx.evaluation.deleteMany({where: {judgeId, round: 2}});
      await tx.judge.update({
        where: {id: judgeId},
        data: {round2RoomId: roomId},
      });

      const roomTeams = await tx.team.findMany({
        where: {round2RoomId: roomId},
        select: {id: true},
      });

      if (roomTeams.length > 0) {
        await tx.evaluation.createMany({
          data: roomTeams.map((team) => ({teamId: team.id, judgeId, round: 2})),
          skipDuplicates: true,
        });
      }

      return tx.judge.findUnique({
        where: {id: judgeId},
        include: {
          user: {select: {username: true}},
          round2Room: {select: {id: true, name: true}},
        },
      });
    });
  }

  async removeJudgeFromRound2Room(judgeId: string) {
    const judge = await prisma.judge.findUnique({where: {id: judgeId}});
    if (!judge) {
      throw new AppError("Judge not found", 404);
    }

    return prisma.$transaction([
      prisma.evaluation.deleteMany({where: {judgeId, round: 2}}),
      prisma.judge.update({where: {id: judgeId}, data: {round2RoomId: null}}),
    ]);
  }

  async assignTeamToRoom(teamId: string, roomId: string) {
    const team = await prisma.team.findUnique({where: {id: teamId}});
    if (!team) {
      throw new AppError("Team not found", 404);
    }

    const room = await prisma.round2Room.findUnique({where: {id: roomId}});
    if (!room) {
      throw new AppError("Round 2 room not found", 404);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.team.update({
        where: {id: teamId},
        data: {round2RoomId: roomId},
      });

      await tx.evaluation.deleteMany({where: {teamId, round: 2}});

      const roomJudges = await tx.judge.findMany({
        where: {round2RoomId: roomId},
        select: {id: true},
      });

      if (roomJudges.length > 0) {
        await tx.evaluation.createMany({
          data: roomJudges.map((j) => ({teamId, judgeId: j.id, round: 2})),
          skipDuplicates: true,
        });
      }

      return updated;
    });
  }

  // Round 3 Management
  async getRound3Candidates(sourceRound = 1) {
    const aggregates = await prisma.teamScore.groupBy({
      by: ["teamId"],
      where: {round: sourceRound, totalScore: {not: null}},
      _avg: {totalScore: true},
      _count: {_all: true},
    });

    console.log('ag', aggregates);

    const scoreByTeam = new Map(
      aggregates.map((a) => [
        a.teamId,
        {
          averageScore: a._avg?.totalScore ?? 0,
          judgeCount: a._count?._all ?? 0,
        },
      ]),
    );

    console.log('scoreByTeam', scoreByTeam);

    const teams = await prisma.team.findMany({
      where: {status: {in: ["ROUND1_QUALIFIED", "ROUND2_SUBMITTED", "ROUND2_QUALIFIED"]}},
      select: {
        id: true,
        name: true,
        teamId: true,
        status: true,
        round3Room: {select: {id: true, name: true}},
      },
    });

    console.log('teams', teams);

    return teams
      .map((team) => ({
        ...team,
        averageScore: scoreByTeam.get(team.id)?.averageScore ?? null,
        judgeCount: scoreByTeam.get(team.id)?.judgeCount ?? 0,
      }))
      .sort((a, b) => (b.averageScore ?? -1) - (a.averageScore ?? -1));
  }

  async selectTopTeamsForRound3(limit = 30, sourceRound = 2) {
    const assignedCount = await prisma.team.count({
      where: {round3RoomId: {not: null}},
    });

    if (assignedCount > 0) {
      throw new AppError(
        "Some teams are already assigned to Round 3 rooms. Release room assignments before re-selecting.",
        400,
      );
    }

    const candidates = await this.getRound3Candidates(sourceRound);
    const scored = candidates.filter((c) => c.averageScore !== null);
    const top = scored.slice(0, limit);

    if (top.length === 0) {
      throw new AppError(`No teams have scores from Round ${sourceRound} yet.`, 400);
    }

    await prisma.team.updateMany({
      where: {id: {in: top.map((t) => t.id)}},
      data: {status: "ROUND2_QUALIFIED"},
    });

    return top;
  }

  private async ensureRound3Rooms() {
    for (const name of ROUND3_ROOM_NAMES) {
      await prisma.round3Room.upsert({
        where: {name},
        update: {capacity: ROUND3_ROOM_CAPACITY},
        create: {name, capacity: ROUND3_ROOM_CAPACITY},
      });
    }

    // Drop rooms no longer in the configured list, as long as nothing depends on them.
    const stale = await prisma.round3Room.findMany({
      where: {name: {notIn: ROUND3_ROOM_NAMES}},
      include: {_count: {select: {teams: true, judges: true}}},
    });

    for (const room of stale) {
      if (room._count.teams > 0 || room._count.judges > 0) continue;
      await prisma.round3Room.delete({where: {id: room.id}});
    }
  }

  async getRound3Rooms() {
    await this.ensureRound3Rooms();

    return prisma.round3Room.findMany({
      orderBy: {name: "asc"},
      include: {
        teams: {
          orderBy: {name: "asc"},
          select: {id: true, name: true, teamId: true, status: true},
        },
        judges: {
          orderBy: {name: "asc"},
          select: {
            id: true,
            name: true,
            user: {select: {username: true}},
            evaluations: {where: {round: 3}, select: {id: true, status: true}},
          },
        },
      },
    });
  }

  async removeJudgeFromRound3Room(judgeId: string) {
    const judge = await prisma.judge.findUnique({where: {id: judgeId}});
    if (!judge) {
      throw new AppError("Judge not found", 404);
    }

    return prisma.$transaction([
      prisma.evaluation.deleteMany({where: {judgeId, round: 3}}),
      prisma.judge.update({where: {id: judgeId}, data: {round3RoomId: null}}),
    ]);
  }

  async assignJudgeToRound3Room(judgeId: string, roomId: string) {
    const judge = await prisma.judge.findUnique({where: {id: judgeId}});
    if (!judge) {
      throw new AppError("Judge not found", 404);
    }

    const room = await prisma.round3Room.findUnique({where: {id: roomId}});
    if (!room) {
      throw new AppError("Round 3 room not found", 404);
    }

    return prisma.$transaction(async (tx) => {
      await tx.evaluation.deleteMany({where: {judgeId, round: 3}});
      await tx.judge.update({
        where: {id: judgeId},
        data: {round3RoomId: roomId},
      });

      const roomTeams = await tx.team.findMany({
        where: {round3RoomId: roomId},
        select: {id: true},
      });

      if (roomTeams.length > 0) {
        await tx.evaluation.createMany({
          data: roomTeams.map((team) => ({teamId: team.id, judgeId, round: 3})),
          skipDuplicates: true,
        });
      }

      return tx.judge.findUnique({
        where: {id: judgeId},
        include: {
          user: {select: {username: true}},
          round3Room: {select: {id: true, name: true}},
        },
      });
    });
  }

  async autoAssignRound3Teams() {
    const rooms = await prisma.round3Room.findMany({
      orderBy: {name: "asc"},
      include: {judges: {select: {id: true}}},
    });

    if (rooms.length === 0) {
      throw new AppError("No Round 3 meeting rooms configured.", 400);
    }

    const unstaffed = rooms.filter((r) => r.judges.length === 0);
    if (unstaffed.length > 0) {
      throw new AppError(
        `Assign judges to these rooms first: ${unstaffed.map((r) => r.name).join(", ")}`,
        400,
      );
    }

    const existingScores = await prisma.teamScore.count({where: {round: 3}});
    if (existingScores > 0) {
      throw new AppError(
        "Round 3 judging has already started. Teams cannot be redistributed.",
        400,
      );
    }

    const candidates = await this.getRound3Candidates();
    const selectedTeams = candidates.filter(
      (t) => t.status === "ROUND2_QUALIFIED",
    );

    if (selectedTeams.length === 0) {
      throw new AppError(
        "No teams selected for Round 3 yet. Select the top teams first.",
        400,
      );
    }

    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    if (selectedTeams.length > totalCapacity) {
      throw new AppError(
        `Selected teams (${selectedTeams.length}) exceed total room capacity (${totalCapacity}).`,
        400,
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.evaluation.deleteMany({where: {round: 3}});
      await tx.team.updateMany({
        where: {round3RoomId: {not: null}},
        data: {round3RoomId: null},
      });

      const load = new Map<string, number>(rooms.map((r) => [r.id, 0]));
      const assignment = new Map<string, string>();
      let index = 0;
      let direction = 1;

      for (const team of selectedTeams) {
        let placed = false;

        for (let hops = 0; hops < rooms.length && !placed; hops++) {
          const room = rooms[index];
          if ((load.get(room.id) ?? 0) < room.capacity) {
            assignment.set(team.id, room.id);
            load.set(room.id, (load.get(room.id) ?? 0) + 1);
            placed = true;
          }
          index += direction;
          if (index >= rooms.length) {
            index = rooms.length - 1;
            direction = -1;
          } else if (index < 0) {
            index = 0;
            direction = 1;
          }
        }

        if (!placed) {
          throw new Error("Could not fit all selected teams into rooms.");
        }
      }

      for (const [teamId, roomId] of assignment) {
        await tx.team.update({where: {id: teamId}, data: {round3RoomId: roomId}});
      }

      const evaluationData: {
        teamId: string
        judgeId: string
        round: number
      }[] = [];

      for (const room of rooms) {
        const roomTeams = [...assignment.entries()]
          .filter(([, roomId]) => roomId === room.id)
          .map(([teamId]) => teamId);

        for (const judge of room.judges) {
          for (const teamId of roomTeams) {
            evaluationData.push({teamId, judgeId: judge.id, round: 3});
          }
        }
      }

      if (evaluationData.length > 0) {
        await tx.evaluation.createMany({
          data: evaluationData,
          skipDuplicates: true,
        });
      }

      return {
        roomsAssigned: [...load.entries()].map(([roomId, count]) => ({
          roomId,
          teams: count,
        })),
        evaluationsCreated: evaluationData.length,
        teamsAssigned: assignment.size,
      };
    });
  }

  async assignTeamToRound3Room(teamId: string, roomId: string) {
    const team = await prisma.team.findUnique({where: {id: teamId}});
    if (!team) {
      throw new AppError("Team not found", 404);
    }

    const room = await prisma.round3Room.findUnique({
      where: {id: roomId},
      include: {_count: {select: {teams: true}}},
    });
    if (!room) {
      throw new AppError("Round 3 room not found", 404);
    }

    if (team.round3RoomId !== roomId && room._count.teams >= room.capacity) {
      throw new AppError(`${room.name} is at full capacity (${room.capacity}).`, 400);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.team.update({
        where: {id: teamId},
        data: {round3RoomId: roomId},
      });

      await tx.evaluation.deleteMany({where: {teamId, round: 3}});

      const roomJudges = await tx.judge.findMany({
        where: {round3RoomId: roomId},
        select: {id: true},
      });

      if (roomJudges.length > 0) {
        await tx.evaluation.createMany({
          data: roomJudges.map((j) => ({teamId, judgeId: j.id, round: 3})),
          skipDuplicates: true,
        });
      }

      return updated;
    });
  }

  async getAllJudges() {
    return prisma.judge.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        evaluations: true,
      }
    });
  }

  async getAllMentors() {
    return prisma.mentor.findMany({
      include: {
        user: {select: {id: true, username: true, role: true}},
        mentorshipQueue: {
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      }
    });
  }

  async getDomains() {
    return prisma.domain.findMany({
      include: {
        problemStatements: {
          include: {
            _count: {
              select: {teams: true},
            },
          },
        },
      },
      orderBy: {name: "asc"},
    });
  }

  async createMentor(payload: { name: string; domain: string; mode: "ONLINE" | "OFFLINE" }) {
    // Generate a random password
    const rawPassword = Math.random().toString(36).slice(-6);
    const hashedPassword = await hashPassword(rawPassword);

    // Create user and mentor profile
    const domains = payload.domain.split(",").map(x => x.trim());
    const user = await prisma.user.create({
      data: {
        username: payload.name.toLowerCase().replace(/\s+/g, "_"),
        password: hashedPassword,
        role: "MENTOR",
        mentorProfile: {
          create: {
            name: payload.name,
            domains: domains,
            mode: payload.mode,
          },
        },
      },
      include: {
        mentorProfile: true,
      },
    });

    const newMentor = await prisma.mentor.findUnique({
      where: {userId: user.id},
      include: {
        user: {select: {id: true, username: true, role: true}},
        mentorshipQueue: {
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {newMentor, rawPassword};
  }

  async deleteMentor(mentorId: string) {
    // Check if mentor exists
    const mentor = await prisma.mentor.findUnique({
      where: {id: mentorId},
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    // MentorshipQueue rows reference the mentor without cascade delete, so
    // clear those first or the user delete fails with a FK constraint error.
    await prisma.$transaction([
      prisma.mentorshipQueue.deleteMany({where: {mentorId}}),
      prisma.user.delete({where: {id: mentor.userId}}),
    ]);
  }

  async addJudge(payload: { name: string; }) {
    // Generate a random 4-character all-caps password
    const rawPassword = Math.random().toString(36).slice(-4).toUpperCase();
    const hashedPassword = await hashPassword(rawPassword);

    // Create user and judge profile
    const user = await prisma.user.create({
      data: {
        username: payload.name
          .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?)\s+/i, "") // remove title at start
          .toLowerCase()
          .replace(/\s+/g, "_"),
        password: hashedPassword,
        role: "JUDGE",
        judgeProfile: {
          create: {
            name: payload.name,
          },
        },
      }
    });

    const newJudge = await prisma.judge.findUnique({
      where: {userId: user.id},
      include: {user: {select: {id: true, username: true, role: true}}},
    });

    return {newJudge, rawPassword};
  }

  async deleteJudge(judgeId: string) {
    // Check if judge exists
    const judge = await prisma.judge.findUnique({
      where: {id: judgeId},
    });

    if (!judge) {
      throw new Error("Judge not found");
    }

    // Evaluation/TeamScore rows reference judgeId without cascade, so they
    // must be removed before the user (and its judge profile) can be deleted.
    return prisma.$transaction([
      prisma.evaluation.deleteMany({where: {judgeId}}),
      prisma.teamScore.deleteMany({where: {judgeId}}),
      prisma.user.delete({where: {id: judge.userId}}),
    ]);
  }

  async getTeamScores() {
    return prisma.team.findMany({
      include: {
        teamScores: {
          select: {
            id: true,
            innovation: true,
            technical: true,
            presentation: true,
            impact: true,
            feasibility: true,
            totalScore: true,
            round: true,
            createdAt: true,
            judge: {
              include: {
                user: { select: { username: true } },
              },
            },
          },
          take: 1,
        },
        evaluations: {
          select: {
            status: true,
            judge: {
              include: {
                user: { select: { username: true } },
              },
            },
          },
        },
      },
    });
  }

  // Get team details for checkpoint 1
  async getTeamForCheckpoint1(teamId: string) {
    const team = await prisma.team.findUnique({
      where: {id: teamId},
      include: {
        participants: {
          orderBy: {createdAt: "asc"},
        },
        checkpoints: {
          where: {checkpoint: 1},
        },
      },
    });

    if (!team) {
      throw new Error("Team not found");
    }

    // Get existing checkpoint 1 data if it exists
    const checkpoint1 = team.checkpoints.find(cp => cp.checkpoint === 1);
    const existingData = checkpoint1?.data as any;

    // If checkpoint exists, use the participants from checkpoint data (which includes isPresent)
    // Otherwise, use participants from teamParticipants table
    let participantsData;
    if (existingData?.participants && Array.isArray(existingData.participants)) {
      // Use checkpoint data which has isPresent status
      participantsData = existingData.participants.map((p: any) => ({
        id: p.id || `cp-${p.email}`, // Use checkpoint participant id or generate one
        name: p.name,
        email: p.email,
        phone: p.phone || '',
        role: p.role,
        isPresent: p.isPresent || false,
        verified: p.isPresent || false,
        residence: p.residence || 'inhouse',
      }));
    } else {
      // Use teamParticipants table data
      participantsData = team.participants.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone || '',
        role: p.role,
        isPresent: p.verified || false, // Use verified field as initial isPresent
        verified: p.verified,
        residence: (p as any).residence || 'inhouse',
      }));
    }

    return {
      id: team.id,
      name: team.name,
      teamId: team.teamId,
      participants: participantsData,
      wifi: existingData?.wifi || false,
      status: checkpoint1?.status || 'pending',
    };
  }

  // Update team checkpoint 1 with partial attendance support
  async updateTeamCheckpoint1(data: Checkpoint1Data) {
    const {teamId, wifi, participants} = data;
    
    // Count present participants
    const presentParticipants = participants.filter(p => p.isPresent);
    const totalParticipants = participants.length;
    
    // Determine status based on attendance
    let status: "COMPLETED" | "PARTIALLY_COMPLETED" = "COMPLETED";
    let notes = "";
    
    if (presentParticipants.length < 2) {
      throw new Error("At least 2 participants must be marked as present to complete checkpoint 1");
    } else if (presentParticipants.length < totalParticipants) {
      status = "PARTIALLY_COMPLETED";
      notes = `Only ${presentParticipants.length} out of ${totalParticipants} participants were present`;
    }

    // Use transaction to ensure data consistency
    return prisma.$transaction(async (tx) => {
      // 1. Delete existing team participants
      await tx.teamParticipant.deleteMany({
        where: {teamId}
      });

      // 2. Create new team participants from the frontend data
      for (const participant of participants) {
        await tx.teamParticipant.create({
          data: {
            teamId,
            name: participant.name,
            email: participant.email,
            phone: participant.phone,
            role: participant.role || "MEMBER",
            verified: participant.isPresent || false, // Use Verified field to track presence
            residence: participant.residence || "inhouse",
          },
        });
      }

      // 3. Create or update checkpoint record
      return tx.teamCheckpoint.upsert({
        where: {
          teamId_checkpoint: {
            teamId,
            checkpoint: 1,
          },
        },
        update: {
          data: {
            wifi,
            participants: participants.map(p => ({
              name: p.name,
              email: p.email,
              phone: p.phone,
              role: p.role,
              isPresent: p.isPresent,
              residence: p.residence || 'inhouse',
            })),
            totalParticipants: participants.length,
            presentCount: presentParticipants.length,
            inhouseCount: participants.filter(p => (p.residence || 'inhouse') === 'inhouse').length,
            outhouseCount: participants.filter(p => p.residence === 'outhouse').length,
            notes: notes,
          },
          status: status,
          completedAt: new Date(),
        },
        create: {
          teamId,
          checkpoint: 1,
          data: {
            wifi,
            participants: participants.map(p => ({
              name: p.name,
              email: p.email,
              phone: p.phone,
              role: p.role,
              isPresent: p.isPresent,
              residence: p.residence || 'inhouse',
            })),
            totalParticipants: participants.length,
            presentCount: presentParticipants.length,
            inhouseCount: participants.filter(p => (p.residence || 'inhouse') === 'inhouse').length,
            outhouseCount: participants.filter(p => p.residence === 'outhouse').length,
            notes: notes,
          },
          status: status,
          completedAt: new Date(),
        },
      });
    });
  }

  async updateTeamCheckpoint2(payload: Checkpoint2Data) {
    const team = await prisma.team.findUnique({
      where: {id: payload.teamId},
    });
    if (!team) {
      throw new Error("Team not found");
    }

    const username = team.teamId;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    // Check if checkpoint already exists with stored password
    const existingCheckpoint = await prisma.teamCheckpoint.findUnique({
      where: {
        teamId_checkpoint: {
          teamId: payload.teamId,
          checkpoint: 2,
        },
      },
    });

    let password = "";
    let isNewUser = false;

    if (existingUser && existingCheckpoint?.data && typeof existingCheckpoint.data === 'object' && 'password' in existingCheckpoint.data) {
      // User and checkpoint exist, retrieve stored password
      password = (existingCheckpoint.data as any).password;
    } else if (!existingUser) {
      // Create new user with credentials
      password = Math.random().toString(36).slice(-6);
      const hash = await hashPassword(password);
      
      await prisma.user.create({
        data: {
          username,
          password: hash,
          role: "TEAM",
          teamId: payload.teamId,
        },
      });
      isNewUser = true;
    } else {
      // User exists but no checkpoint with password - generate new password and update user
      password = Math.random().toString(36).slice(-6);
      const hash = await hashPassword(password);
      
      await prisma.user.update({
        where: { username },
        data: { password: hash },
      });
    }

    const t2 = prisma.teamCheckpoint.upsert({
      where: {
        teamId_checkpoint: {
          teamId: payload.teamId,
          checkpoint: 2,
        },
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
        data: {
          password: password, // Store password in checkpoint data
        },
      },
      create: {
        teamId: payload.teamId,
        checkpoint: 2,
        status: "COMPLETED",
        completedAt: new Date(),
        data: {
          password: password, // Store password in checkpoint data
        },
      },
    });

    const availableRoom = await prisma.round1Room.findFirst({
      where: {
        filled: {lt: prisma.round1Room.fields.capacity},
      },
      orderBy: {id: "asc"},
    });

    if (!availableRoom) {
      throw new Error("No available Round1Room found");
    }

    const t3 = prisma.team.update({
      where: {id: payload.teamId},
      data: {
        round1Room: {
          connect: {
            id: availableRoom.id,
          },
        },
      },
      select: {round1Room: true},
    });

    const t4 = prisma.round1Room.update({
      where: {id: availableRoom.id},
      data: {filled: {increment: 1}},
    });

    const [checkpoint, round1Room] = await prisma.$transaction([t2, t3, t4]);
    return {
      username: username,
      round1Room: round1Room.round1Room,
      password: password,
      checkpoint,
    }
  }

  async updateTeamCheckpoint3(data: { teamId: string }) {
    const {teamId} = data;
    return prisma.teamCheckpoint.upsert({
      where: {
        teamId_checkpoint: {
          teamId,
          checkpoint: 3,
        },
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      create: {
        teamId,
        checkpoint: 3,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }
}

export const superAdminService = new SuperAdminService();
