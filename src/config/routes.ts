// ---------------------------------------------------------------------------
// Route paths — single source of truth for all route path templates
// ---------------------------------------------------------------------------

export const ROUTE_PATHS = {
  // Root
  root: "/",
  login: "/login",

  // Personal scopes
  work: "/work",
  intake: "/intake",

  // Queue views
  queue: "/queue/:queueKey",

  // Case detail (matches router.tsx: /case/:caseType/:caseId)
  caseDetail: "/case/:caseType/:caseId",

  // Guided runner
  caseRun: "/case/:caseType/:caseId/run",

  // Saved views (future)
  savedView: "/view/:viewKey",

  // Role inbox (future)
  roleInbox: "/inbox/:roleInboxKey",

  // Settings
  settings: "/settings",

  // Access denied
  accessDenied: "/access-denied",

  // Catch-all
  notFound: "*",
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

// ---------------------------------------------------------------------------
// Path builder helpers — replace :param placeholders with concrete values
// ---------------------------------------------------------------------------

export function queuePath(queueKey: string): string {
  return `/queue/${queueKey}`;
}

export function caseDetailPath(caseType: string, caseId: string): string {
  return `/case/${caseType}/${caseId}`;
}

export function caseRunPath(caseType: string, caseId: string): string {
  return `/case/${caseType}/${caseId}/run`;
}

export function savedViewPath(viewKey: string): string {
  return `/view/${viewKey}`;
}

export function roleInboxPath(roleInboxKey: string): string {
  return `/inbox/${roleInboxKey}`;
}
