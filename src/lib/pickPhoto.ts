import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/** Opens the photo library or the camera and returns the chosen image's local URI, or null if cancelled. */
export async function pickRoomPhoto(from: 'library' | 'camera'): Promise<string | null> {
  if (from === 'camera' && Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access is off', 'Turn on camera access for Expo Go in Settings to take a room photo.');
      return null;
    }
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.85 };
  const result =
    from === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}
