import { ImageSourcePropType } from 'react-native';

/**
 * Returns the correct ImageSourcePropType for local (require) and remote (URI) images.
 * - Local images from require() are numbers on native, objects/strings on web
 * - Remote images are strings (URIs)
 */
export function getImageSource(img: string | number | object): ImageSourcePropType {
  if (typeof img === 'number') return img;               // native require() asset ID
  if (typeof img === 'object') return img as ImageSourcePropType; // web require() returns module object
  return { uri: img };                                    // remote URI string
}
