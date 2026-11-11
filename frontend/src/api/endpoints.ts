/**
 * API endpoint constants for the School Admission System.
 * Static paths are plain strings; paths with dynamic segments are functions.
 * No API calls are made here.
 */

// ── Classes ────────────────────────────────────────────────────────────────

/** POST /classes  — create a new class */
export const CLASSES_CREATE = "/classes"

/** GET  /classes  — list all classes */
export const CLASSES_LIST = "/classes"

/** GET  /classes/{classId}  — get a single class */
export const CLASSES_DETAIL = (classId: string | number) =>
  `/classes/${classId}`

// ── Holds ──────────────────────────────────────────────────────────────────

/** POST /classes/{classId}/holds  — place a seat hold for a class */
export const HOLDS_CREATE = (classId: string | number) =>
  `/classes/${classId}/holds`

/** GET  /holds/{holdId}  — get a single hold */
export const HOLDS_DETAIL = (holdId: string | number) => `/holds/${holdId}`

/** POST /holds/{holdId}/confirm  — confirm (finalise) a hold */
export const HOLDS_CONFIRM = (holdId: string | number) =>
  `/holds/${holdId}/confirm`

/** DELETE /holds/{holdId}  — cancel a hold */
export const HOLDS_CANCEL = (holdId: string | number) => `/holds/${holdId}`

// ── Current student ────────────────────────────────────────────────────────

/** GET /me/holds  — list all holds belonging to the current student */
export const ME_HOLDS = "/me/holds"
