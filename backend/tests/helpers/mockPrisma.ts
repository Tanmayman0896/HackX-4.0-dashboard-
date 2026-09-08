import { vi } from "vitest";

function createModelMock() {
  return {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  };
}

export const mockPrisma = {
  user: createModelMock(),
  team: createModelMock(),
  teamParticipant: createModelMock(),
  problemStatement: createModelMock(),
  pSBookmark: createModelMock(),
  submission: createModelMock(),
  evaluation: createModelMock(),
  teamScore: createModelMock(),
  judge: createModelMock(),
  mentor: createModelMock(),
  mentorshipQueue: createModelMock(),
  round1Room: {
    ...createModelMock(),
    fields: { capacity: 6 },
  },
  round2Room: createModelMock(),
  round3Room: createModelMock(),
  teamCheckpoint: createModelMock(),
  systemSettings: createModelMock(),
  announcement: createModelMock(),
  activityLog: createModelMock(),
  domain: createModelMock(),

  $transaction: vi.fn(async (arg: any) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === "function") {
      return arg(mockPrisma);
    }
    return arg;
  }),
  $connect: vi.fn(async () => {}),
  $disconnect: vi.fn(async () => {}),
  $on: vi.fn(),
};

// Reset all mocks helper
export function resetPrismaMocks() {
  Object.values(mockPrisma).forEach((mockVal: any) => {
    if (typeof mockVal === "object" && mockVal !== null) {
      Object.values(mockVal).forEach((fn: any) => {
        if (typeof fn?.mockReset === "function") {
          fn.mockReset();
        }
      });
    } else if (typeof mockVal?.mockReset === "function") {
      mockVal.mockReset();
    }
  });

  // Re-establish default $transaction behavior
  mockPrisma.$transaction.mockImplementation(async (arg: any) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === "function") {
      return arg(mockPrisma);
    }
    return arg;
  });
}

// Automatically mock @prisma/client
vi.mock("@prisma/client", () => {
  class PrismaClient {
    constructor() {
      return mockPrisma;
    }
  }
  return {
    PrismaClient,
  };
});
