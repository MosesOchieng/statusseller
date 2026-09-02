export function toPublicUrl(link: string | undefined, fallback = 'https://statusseller.app/p/demo'): string {
  if (!link) return fallback;
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}