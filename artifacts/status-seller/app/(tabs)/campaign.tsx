// Placeholder — Campaign is accessed via the "+" button in the tab bar
// which navigates to /campaign/create as a modal stack screen.
import { Redirect } from 'expo-router';
export default function CampaignTab() {
  return <Redirect href="/campaign/create" />;
}
