// ProfileEditScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import {
  fetchProfile,
  updateSuperAdminProfile,
  uploadSuperAdminImage,
  updateClubAdminProfile,
  uploadClubAdminImage,
} from '../../api/auth';
import { API_BASE_URL } from '../../utils/constants';

/* ================= TYPES ================= */

type PickedImage = {
  uri: string;
  name: string;
  type: string;
};

type Role = 'SUPER_ADMIN' | 'CLUB_ADMIN';

/* ================= CONSTANTS ================= */

const PROFILE_CACHE_KEY = 'CACHED_PROFILE';

/* ================= COMPONENT ================= */

const ProfileEditScreen = () => {
  const navigation = useNavigation<any>();

  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  /* ================= HELPERS ================= */

  const hydrateProfile = (profile: any) => {
    if (!profile) return;

    setRole(profile.role);

    if (profile.role === 'SUPER_ADMIN') {
      setUserId(profile.super_admin_id);
    } else {
      setUserId(profile.admin_id);
    }

    setName(profile.name ?? '');
    setEmail(profile.email ?? '');
    setPhone(profile.phone ?? '');

    if (profile.profile_image) {
      setPhotoUri(`${API_BASE_URL}/uploads/${profile.profile_image}`);
    }
  };

  const loadCachedProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (raw) {
        hydrateProfile(JSON.parse(raw));
      }
    } catch (e) {
      console.log('❌ Failed to load cached profile', e);
    }
  };

  const saveProfileToCache = async (profile: any) => {
    try {
      await AsyncStorage.setItem(
        PROFILE_CACHE_KEY,
        JSON.stringify(profile),
      );
    } catch (e) {
      console.log('❌ Failed to save profile cache', e);
    }
  };

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    let active = true;

    (async () => {
      // 1️⃣ Load cached profile first (OFFLINE SUPPORT)
      await loadCachedProfile();

      // 2️⃣ Check internet
      const net = await NetInfo.fetch();
      if (!net.isConnected) return;

      // 3️⃣ Fetch latest from server
      try {
        const profile = await fetchProfile();
        if (!active || !profile) return;

        hydrateProfile(profile);
        await saveProfileToCache(profile);
      } catch (err) {
        console.log('PROFILE LOAD ERROR', err);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  /* ================= IMAGE PICKER ================= */

  const handleChoosePhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      response => {
        if (response.didCancel || response.errorCode) return;

        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        setPhoto({
          uri: asset.uri,
          name: asset.fileName ?? `profile_${Date.now()}.jpg`,
          type: asset.type ?? 'image/jpeg',
        });

        setPhotoUri(asset.uri);
      },
    );
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {
    const net = await NetInfo.fetch();

    if (!net.isConnected) {
      Alert.alert(
        'Offline',
        'You are offline. Profile updates require internet.',
      );
      return;
    }

    if (!userId || !role) {
      Alert.alert('Error', 'User not found. Please re-login.');
      return;
    }

    try {
      if (role === 'SUPER_ADMIN') {
        await updateSuperAdminProfile(userId, { name, email, phone });
        if (photo) await uploadSuperAdminImage(userId, photo);
      }

      if (role === 'CLUB_ADMIN') {
        await updateClubAdminProfile(userId, { name, email, phone });
        if (photo) await uploadClubAdminImage(userId, photo);
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.log('PROFILE UPDATE ERROR', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to update profile',
      );
    }
  };

  /* ================= UI ================= */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 👤 PROFILE IMAGE */}
      <View style={styles.photoContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
          </View>
        )}

        <TouchableOpacity style={styles.photoButton} onPress={handleChoosePhoto}>
          <Text style={styles.photoButtonText}>Change Picture</Text>
        </TouchableOpacity>
      </View>

      {/* NAME */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>

      {/* EMAIL */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* PHONE */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* SAVE */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  photoContainer: { alignItems: 'center', marginBottom: 30 },
  photo: { width: 110, height: 110, borderRadius: 55 },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  photoPlaceholderText: { color: '#666', fontSize: 12 },
  photoButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  photoButtonText: { color: '#007AFF', fontWeight: '500' },
  fieldContainer: { marginBottom: 18 },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ProfileEditScreen;
