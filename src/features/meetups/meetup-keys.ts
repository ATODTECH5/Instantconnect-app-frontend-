/** Separate from the hooks so chat's socket can invalidate it without importing meetups' hooks. */
export const OPEN_MEETUP_KEY = ["meetups", "open"] as const;
