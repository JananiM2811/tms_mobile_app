import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirm dialog. Resolves true when the user confirms.
 * Uses window.confirm on web and a native Alert on Android / iOS.
 */
export const confirmAction = (message, title = 'Please Confirm') => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm) {
      return Promise.resolve(window.confirm(message));
    }
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
};
