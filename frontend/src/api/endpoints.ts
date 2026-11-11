export const CLASSES_CREATE = "/classes"
export const CLASSES_LIST = "/classes"
export const CLASSES_DETAIL = (classId: string | number) =>
  `/classes/${classId}`

export const HOLDS_CREATE = (classId: string | number) =>
  `/classes/${classId}/holds`

export const HOLDS_DETAIL = (holdId: string | number) => `/holds/${holdId}`

export const HOLDS_CONFIRM = (holdId: string | number) =>
  `/holds/${holdId}/confirm`

export const HOLDS_CANCEL = (holdId: string | number) => `/holds/${holdId}`

export const ME_HOLDS = "/me/holds"
