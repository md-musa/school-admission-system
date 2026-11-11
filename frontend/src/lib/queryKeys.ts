/** Centralized query key registry — import keys from here, never inline them. */
export const QUERY_KEYS = {
  classes: {
    all: ["classes"] as const,
  },
  holds: {
    all: ["holds"] as const,
    detail: (holdId: string) => ["holds", holdId] as const,
  },
  me: {
    holds: ["me", "holds"] as const,
  },
} as const
