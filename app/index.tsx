import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(auth)/welcome" />; // or your true starting route
}
