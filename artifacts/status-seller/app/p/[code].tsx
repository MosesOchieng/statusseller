import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function PublicPosterLink() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return <Redirect href={`/shop/${code ?? ''}` as any} />;
}