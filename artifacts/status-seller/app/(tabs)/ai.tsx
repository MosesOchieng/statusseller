import { Redirect } from 'expo-router';
// AI Sales Assistant is now accessible via /ai-chat route from the home dashboard
export default function AITab() {
  return <Redirect href="/ai-chat" />;
}
