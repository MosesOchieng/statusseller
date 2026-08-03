import { Redirect } from 'expo-router';
// Profile is accessible via the home header settings icon
export default function ProfileTab() {
  return <Redirect href="/(tabs)" />;
}
