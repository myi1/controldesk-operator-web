// ---------------------------------------------------------------------------
// Route paths — single source of truth for all route path templates
// ---------------------------------------------------------------------------

export const ROUTE_PATHS = {
  // Root
  root: "/",
  login: "/login",

  // Queue views
  queue: "/queue/:queueKey",
  queueWithScope: "/queue/:queueKey/scope/:scopeKey",

  // Case detail
  caseDetail: "/queue/:queueKey/case/:doctype/:docname",
  caseTimeline: "/queue/:queueKey/case/:doctype/:docname/timeline",
  caseActions: "/queue/:queueKey/case/:doctype/:docname/actions",

  // Saved views
  savedView: "/view/:viewKey",

  // Role inbox
  roleInbox: "/inbox/:roleInboxKey",

  // Settings
  settings: "/settings",
  settingsProfile: "/settings/profile",
  settingsPreferences: "/settings/preferences",

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

export function queueScopePath(queueKey: string, scopeKey: string): string {
  return `/queue/${queueKey}/scope/${scopeKey}`;
}

export function caseDetailPath(
  queueKey: string,
  doctype: string,
  docname: string,
): string {
  return `/queue/${queueKey}/case/${doctype}/${docname}`;
}

export function caseTimelinePath(
  queueKey: string,
  doctype: string,
  docname: string,
): string {
  return `/queue/${queueKey}/case/${doctype}/${docname}/timeline`;
}

export function caseActionsPath(
  queueKey: string,
  doctype: string,
  docname: string,
): string {
  return `/queue/${queueKey}/case/${doctype}/${docname}/actions`;
}

export function savedViewPath(viewKey: string): string {
  return `/view/${viewKey}`;
}

export function roleInboxPath(roleInboxKey: string): string {
  return `/inbox/${roleInboxKey}`;
}
