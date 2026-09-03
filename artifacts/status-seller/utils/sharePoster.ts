import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

type PosterViewRef = { current: unknown };

type SharePosterOptions = {
  viewRef: PosterViewRef;
  fileName: string;
  caption: string;
  title: string;
};

function downloadDataUri(dataUri: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function sharePoster({ viewRef, fileName, caption, title }: SharePosterOptions) {
  if (!viewRef.current) throw new Error('The poster is still preparing. Try again in a moment.');

  if (Platform.OS === 'web') {
    const dataUri = await captureRef(viewRef.current, {
      format: 'jpg',
      quality: 0.95,
      result: 'data-uri',
    });
    const response = await fetch(dataUri);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    const shareData = { files: [file], text: caption, title };
    const browserNavigator = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
      share?: (data?: ShareData) => Promise<void>;
    };

    if (browserNavigator.share && browserNavigator.canShare?.({ files: [file] })) {
      await browserNavigator.share(shareData);
      return;
    }

    downloadDataUri(dataUri, fileName);
    throw new Error('The browser cannot open a file share sheet, so the poster was downloaded instead.');
  }

  const uri = await captureRef(viewRef.current, {
    format: 'jpg',
    quality: 0.95,
    result: 'tmpfile',
  });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Native sharing is not available on this device.');
  }
  await Sharing.shareAsync(uri, {
    dialogTitle: title,
    mimeType: 'image/jpeg',
    UTI: 'public.jpeg',
  });
}