import { Redirect } from 'expo-router';

// Unknown paths (e.g. when the web build is hosted under a sub-path) go to the welcome screen.
export default function NotFound() {
  return <Redirect href="/" />;
}
