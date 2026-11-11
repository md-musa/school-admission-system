export const QUERY_KEYS = {
  classes: {
    all: ["classes"] as const,
    detail: (classId: string) => ["classes", classId] as const,
  },
  holds: {
    all: ["holds"] as const,
    detail: (holdId: string) => ["holds", holdId] as const,
    me: (studentId: string) => ["holds", "me", studentId] as const,
  },
} as const
