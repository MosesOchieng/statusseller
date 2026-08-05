/**
 * Safely extract a route parameter from req.params.
 * Express 5 types params as `string | string[]`; this narrows it to a plain string.
 */
export function getParam(
  params: Record<string, string | string[]>,
  key: string,
): string | undefined {
  const val = params[key];
  if (val === undefined) return undefined;
  return Array.isArray(val) ? val[0] : val;
}
