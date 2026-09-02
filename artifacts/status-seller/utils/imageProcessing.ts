import { Image as RNImage, Platform } from 'react-native';

function resolveImageUri(source: unknown): string {
  if (typeof source === 'string') return source;
  if (source && typeof source === 'object' && 'uri' in source && typeof source.uri === 'string') {
    return source.uri;
  }
  const resolved = RNImage.resolveAssetSource(source as number);
  if (resolved?.uri) return resolved.uri;
  throw new Error('The image source is not available in this editor.');
}

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be loaded for editing.'));
    image.src = uri;
  });
}

/**
 * Lightweight, local cutout for web/PWA uploads. It flood-fills pixels close
 * to the sampled corner colour, which works well for clean product photos and
 * never uploads the seller's image anywhere.
 */
export async function removeImageBackground(source: unknown): Promise<string> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    throw new Error('Automatic cutout is available in the web editor.');
  }

  const image = await loadImage(resolveImageUri(source));
  const canvas = document.createElement('canvas');
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('The browser could not prepare the image editor.');

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = pixels;
  const samplePoints = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  const background = samplePoints.reduce(
    (sum, [x, y]) => {
      const index = (y * width + x) * 4;
      return [sum[0] + data[index], sum[1] + data[index + 1], sum[2] + data[index + 2]];
    },
    [0, 0, 0],
  ).map((value) => value / samplePoints.length);

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const threshold = 48;
  const shouldRemove = (pixelIndex: number) => {
    const distance = Math.sqrt(
      (data[pixelIndex] - background[0]) ** 2 +
      (data[pixelIndex + 1] - background[1]) ** 2 +
      (data[pixelIndex + 2] - background[2]) ** 2,
    );
    return distance < threshold && data[pixelIndex + 3] > 0;
  };
  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (visited[index]) return;
    visited[index] = 1;
    const pixelIndex = index * 4;
    if (!shouldRemove(pixelIndex)) return;
    queue.push(index);
    data[pixelIndex + 3] = 0;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    const x = index % width;
    const y = Math.floor(index / width);
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL('image/png');
}

export type PosterExportOptions = {
  productSource?: unknown;
  backgroundSource?: unknown;
  logoSource?: unknown;
  title: string;
  price: string;
  badge: string;
  link: string;
  backgroundColor: string;
  showLogo: boolean;
  showLink: boolean;
  fit: 'cover' | 'contain';
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  effect: string;
};

function coverRect(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number, fit: 'cover' | 'contain') {
  const scale = fit === 'cover'
    ? Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
    : Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return { x: (targetWidth - width) / 2, y: (targetHeight - height) / 2, width, height };
}

export async function renderPosterToDataUrl(options: PosterExportOptions): Promise<string> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    throw new Error('Poster downloads are available in the web editor.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The browser could not render this poster.');

  context.fillStyle = options.backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (options.backgroundSource) {
    const background = await loadImage(resolveImageUri(options.backgroundSource));
    const rect = coverRect(background.naturalWidth, background.naturalHeight, canvas.width, canvas.height, 'cover');
    context.drawImage(background, rect.x, rect.y, rect.width, rect.height);
    context.fillStyle = 'rgba(10, 15, 35, 0.22)';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.fillStyle = 'rgba(10, 15, 35, 0.34)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (options.productSource) {
    const product = await loadImage(resolveImageUri(options.productSource));
    const productRect = coverRect(product.naturalWidth, product.naturalHeight, 860, 850, options.fit);
    const filterWarmth = options.warmth > 0 ? ` sepia(${Math.min(options.warmth, 50) / 100})` : '';
    context.save();
    context.filter = `brightness(${100 + options.brightness}%) contrast(${options.contrast}%) saturate(${options.saturation}%)${filterWarmth}`;
    context.drawImage(product, 110 + productRect.x, 350 + productRect.y, productRect.width, productRect.height);
    context.restore();
  }

  const effectOverlay = options.effect === 'dreamy'
    ? 'rgba(255,255,255,0.10)'
    : options.effect === 'warm'
      ? 'rgba(245,158,11,0.10)'
      : options.effect === 'mono'
        ? 'rgba(0,0,0,0.08)'
        : 'transparent';
  if (effectOverlay !== 'transparent') {
    context.fillStyle = effectOverlay;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (options.showLogo && options.logoSource) {
    const logo = await loadImage(resolveImageUri(options.logoSource));
    const logoRect = coverRect(logo.naturalWidth, logo.naturalHeight, 190, 110, 'contain');
    context.drawImage(logo, 70 + logoRect.x, 90 + logoRect.y, logoRect.width, logoRect.height);
  }

  context.fillStyle = '#ffffff';
  context.font = '700 34px Inter, Arial, sans-serif';
  context.fillText(options.badge, 70, 250);
  context.font = '700 64px Inter, Arial, sans-serif';
  const title = options.title.length > 24 ? `${options.title.slice(0, 23)}…` : options.title;
  context.fillText(title.toUpperCase(), 70, 315);
  context.fillStyle = '#25D366';
  context.font = '700 48px Inter, Arial, sans-serif';
  context.fillText(options.price, 70, 1320);
  context.fillStyle = 'rgba(255,255,255,0.78)';
  context.font = '400 28px Inter, Arial, sans-serif';
  context.fillText('Free Delivery Nairobi', 70, 1360);

  if (options.showLink) {
    context.fillStyle = '#ffffff';
    context.roundRect(70, 1420, 940, 100, 28);
    context.fill();
    context.fillStyle = '#111827';
    context.font = '700 32px Inter, Arial, sans-serif';
    context.fillText('Shop Now', 445, 1483);
  }

  context.fillStyle = 'rgba(255,255,255,0.78)';
  context.font = '600 26px Inter, Arial, sans-serif';
  context.fillText('Tap the link in the caption to shop', 70, 1810);
  return canvas.toDataURL('image/jpeg', 0.92);
}