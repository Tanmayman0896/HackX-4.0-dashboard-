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

  $transaction: vi.fn(async (arg: unknown) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === "function") {
      return (arg as (tx: typeof mockPrisma) => unknown)(mockPrisma);
    }
    return arg;
  }),
  $connect: vi.fn(async () => {}),
  $disconnect: vi.fn(async () => {}),
  $on: vi.fn(),
};

// Reset all mocks helper
export function resetPrismaMocks() {
  Object.values(mockPrisma).forEach((mockVal: unknown) => {
    if (typeof mockVal === "object" && mockVal !== null) {
      Object.values(mockVal as Record<string, unknown>).forEach((fn: unknown) => {
        const maybeMock = fn as { mockReset?: () => void };
        if (typeof maybeMock?.mockReset === "function") {
          maybeMock.mockReset();
        }
      });
    } else {
      const maybeMock = mockVal as { mockReset?: () => void };
      if (typeof maybeMock?.mockReset === "function") {
        maybeMock.mockReset();
      }
    }
  });

  // Re-establish default $transaction behavior
  mockPrisma.$transaction.mockImplementation(async (arg: unknown) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === "function") {
      return (arg as (tx: typeof mockPrisma) => unknown)(mockPrisma);
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
