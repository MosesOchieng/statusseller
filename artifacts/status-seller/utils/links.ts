export function toPublicUrl(link: string | undefined, fallback = 'https://statusseller.app/p/demo'): string {
  if (!link) return fallback;
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

export function getPublicCode(link: string | undefined): string {
  if (!link) return '';
  try {
    const normalized = /^https?:\/\//i.test(link) ? link : `https://${link}`;
    const url = new URL(normalized);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.at(-1) ?? '';
  } catch {
    return link.split('/').filter(Boolean).pop() ?? '';
  }
}

export function removeShopLinkLine(caption: string | undefined): string {
  return (caption ?? '')
    .replace(/(?:^|\n)\s*shop\s*now\s*:\s*\S+\s*/gi, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function buildShareCaption(caption: string | undefined, link: string): string {
  const body = removeShopLinkLine(caption);
  if (!link) return body;
  return body ? `${body}\n\nShop now: ${link}` : `Shop now: ${link}`;
}