// Local image assets — use these instead of remote URLs where possible
// React Native require() returns a number (asset ID) at runtime

export const PRODUCT_IMAGES = {
  blackDress: require('../assets/images/products/black-dress.jpg'),
  boatShoes: require('../assets/images/products/boat-shoes.jpg'),
  pearlFlats: require('../assets/images/products/pearl-flats.jpg'),
  oxfordShoes: require('../assets/images/products/oxford-shoes.jpg'),
  vansSneakers: require('../assets/images/products/vans-sneakers.jpg'),
  fashion1: require('../assets/images/products/fashion1.jpg'),
  fashion2: require('../assets/images/products/fashion2.jpg'),
  fashion3: require('../assets/images/products/fashion3.jpg'),
  fashion4: require('../assets/images/products/fashion4.jpg'),
  fashion5: require('../assets/images/products/fashion5.jpg'),
} as const;

export const SOCIAL_LOGOS = {
  whatsapp: require('../assets/images/social/whatsapp.jpeg'),
  facebook: require('../assets/images/social/facebook.webp'),
  tiktok: require('../assets/images/social/tiktok.webp'),
  instagram: require('../assets/images/social/instagram.png'),
} as const;

export const BRAND_ASSETS = {
  logo: require('../assets/images/branding/statusseller-logo.png'),
} as const;

export const CAMPAIGN_BACKGROUNDS = {
  pink: require('../assets/images/backgrounds/pastel-pink.jpg'),
  mint: require('../assets/images/backgrounds/mint-cloud.jpg'),
  lilac: require('../assets/images/backgrounds/lilac-sky.jpg'),
} as const;

export const SPLASH_IMAGES = {
  hero: require('../assets/images/splash/splash-hero.jpg'),
  appLogo: require('../assets/images/splash/app-logo.png'),
  design1: require('../assets/images/splash/design1.png'),
  design2: require('../assets/images/splash/design2.png'),
  design3: require('../assets/images/splash/design3.png'),
} as const;
