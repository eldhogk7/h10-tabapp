import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

/**
 * Clears authentication data only.
 * Navigation MUST be handled by the calling component.
 */
export const logout = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.ROLE,
    STORAGE_KEYS.USER_NAME,
  ]);
};
