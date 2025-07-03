import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import {
  Image,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../utils/supabase';

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function ProfileScreen() {
  const [activeSections, setActiveSections] = useState({});
  const [settings, setSettings] = useState({
    pushAlerts: true,
    darkMode: false,
    notifications: true,
    language: 'English',
    dataSharing: true,
  });

  const user = auth().currentUser;
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState(1); // 0=Beginner, 1=Intermediate, 2=Advanced
  const [goal, setGoal] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch profile data + profile picture
  const fetchProfile = async () => {
    if (!user) return;
    setLoadingProfile(true);
    // Get main profile fields
    const { data, error } = await supabase
      .from('about')
      .select('age, location, fitness_level, goal')
      .eq('user_id', user.uid)
      .single();
    if (data) {
      setAge(data.age ? String(data.age) : '');
      setLocation(data.location || '');
      setGoal(data.goal || '');
      if (data.fitness_level === 'Beginner') setFitnessLevel(0);
      else if (data.fitness_level === 'Advanced') setFitnessLevel(2);
      else setFitnessLevel(1);
    }
    // Get latest/active profile picture
    const { data: pictureData } = await supabase
      .from('profile_pictures')
      .select('image_url')
      .eq('user_id', user.uid)
      .eq('is_active', true)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single();
    setAvatarUrl(pictureData?.image_url || '');
    setLoadingProfile(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('about').upsert({
      user_id: user.uid,
      age: age ? parseInt(age) : null,
      location,
      fitness_level: FITNESS_LEVELS[fitnessLevel],
      goal,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    setSavingProfile(false);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Profile updated!');
  };

  // Upload photo handler
  const pickImage = async () => {
  setUploading(true);
  try {
    // 1. Get permission
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera roll access is required!');
      setUploading(false);
      return;
    }

    // 2. Pick image
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    // 3. Check for valid result (cancel, etc.)
    if (
      !pickerResult ||
      pickerResult.canceled ||
      !pickerResult.assets ||
      !pickerResult.assets.length ||
      !pickerResult.assets[0].uri
    ) {
      setUploading(false);
      return;
    }

    const uri = pickerResult.assets[0].uri;

    // 4. Fetch and validate Blob
    const response = await fetch(uri);
    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      Alert.alert('Upload failed', 'Selected image file is empty.');
      setUploading(false);
      return;
    }

    // 5. Upload to Supabase Storage
    const fileName = `${user.uid}/profile.jpg`;
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, blob, {
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      Alert.alert('Upload failed', uploadError.message);
      setUploading(false);
      return;
    }

    // 6. Get and set the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;
    setAvatarUrl(publicUrl);

    // 7. Deactivate old pictures & add new row to profile_pictures table
    await supabase.from('profile_pictures').update({ is_active: false }).eq('user_id', user.uid);
    await supabase.from('profile_pictures').insert({
      user_id: user.uid,
      image_url: publicUrl,
      is_active: true,
    });

    Alert.alert('Profile Picture Updated!');
  } catch (e) {
    Alert.alert('Upload failed', e.message || String(e));
  }
  setUploading(false);
};



  // Accordions, toggles, etc (unchanged)
  const toggleSection = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    {
      title: 'Important Contacts',
      renderContent: () => (
        <View>
          <Text style={styles.accordionContent}>Add or edit emergency contacts.</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Add New Contact</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      title: 'Devices',
      renderContent: () => (
        <View>
          <Text style={styles.accordionContent}>Connect and manage external devices.</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Link New Device</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      title: 'Notifications',
      renderContent: () => (
        <View>
          <View style={styles.switchRow}>
            <Text style={styles.accordionContent}>Enable or disable app notifications.</Text>
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.accordionContent}>Receive safety alerts and updates.</Text>
            <Switch
              value={settings.pushAlerts}
              onValueChange={() => toggleSetting('pushAlerts')}
            />
          </View>
        </View>
      ),
    },
    {
      title: 'Appearance',
      renderContent: () => (
        <View style={styles.switchRow}>
          <Text style={styles.accordionContent}>Toggle dark mode on or off.</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={() => toggleSetting('darkMode')}
          />
        </View>
      ),
    },
    {
      title: 'Language',
      renderContent: () => (
        <View>
          <Text style={styles.accordionContent}>Current language: {settings.language}</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Change Language</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      title: 'Privacy & Security',
      renderContent: () => (
        <View style={styles.switchRow}>
          <Text style={styles.accordionContent}>Send anonymised data to help us improve the app.</Text>
          <Switch
            value={settings.dataSharing}
            onValueChange={() => toggleSetting('dataSharing')}
          />
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerIcons}>
        <Icon name="heart-outline" size={24} color="white" />
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require('../../assets/images/userIconYellow.png')
              }
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editIcon} onPress={pickImage} disabled={uploading}>
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
            {uploading && (
              <ActivityIndicator
                size="small"
                color="#ffd33d"
                style={{ position: 'absolute', top: 30, left: 30 }}
              />
            )}
          </View>
          {user && (
            <>
              <Text style={styles.name}>{user.displayName || 'Unnamed User'}</Text>
              <Text style={styles.username}>@{user.email?.split('@')[0]}</Text>
            </>
          )}
        </View>

        {/* --- Followers/Following --- */}
        <View style={styles.followWrapper}>
          <View style={styles.followContainer}>
            <Pressable onPress={() => router.push('../followingtabs/followers')} style={styles.followButton}>
              <Text style={styles.followText}>Followers</Text>
            </Pressable>
            <Pressable onPress={() => router.push('../followingtabs/following')} style={styles.followButton}>
              <Text style={styles.followText}>Following</Text>
            </Pressable>
          </View>
        </View>

        {/* ---- PROFILE INFO CARD ---- */}
        <View style={styles.profileInfoCard}>
          <Text style={styles.profileInfoTitle}>Profile Info for Buddy finding</Text>
          {loadingProfile ? (
            <ActivityIndicator color="#ffd33d" size="large" style={{ marginVertical: 12 }} />
          ) : (
            <>
              {/* Age */}
              <Text style={styles.label}>Age</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                style={styles.inputField}
                placeholder="Enter your age"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                maxLength={2}
              />

              {/* Location */}
              <Text style={styles.label}>Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                style={styles.inputField}
                placeholder="Enter your location"
                placeholderTextColor="#aaa"
                autoCapitalize="words"
              />

              {/* Fitness Level (Buttons) */}
              <Text style={styles.label}>Fitness Level</Text>
              <View style={styles.fitnessLevelButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, fitnessLevel === 0 && styles.actionButtonActive]}
                  onPress={() => setFitnessLevel(0)}
                >
                  <Text style={[styles.actionButtonText, fitnessLevel === 0 && styles.actionButtonTextActive]}>Beginner</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, fitnessLevel === 1 && styles.actionButtonActive]}
                  onPress={() => setFitnessLevel(1)}
                >
                  <Text style={[styles.actionButtonText, fitnessLevel === 1 && styles.actionButtonTextActive]}>Intermediate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, fitnessLevel === 2 && styles.actionButtonActive]}
                  onPress={() => setFitnessLevel(2)}
                >
                  <Text style={[styles.actionButtonText, fitnessLevel === 2 && styles.actionButtonTextActive]}>Advanced</Text>
                </TouchableOpacity>
              </View>

              {/* Goal */}
              <Text style={styles.label}>Workout Goal</Text>
              <TextInput
                value={goal}
                onChangeText={setGoal}
                style={styles.inputField}
                placeholder="e.g. Lose Weight, Gain Muscle, Cardio"
                placeholderTextColor="#aaa"
                autoCapitalize="words"
              />

              <TouchableOpacity
                style={[styles.actionButton, { marginTop: 8, marginBottom: 0 }, savingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {savingProfile ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* --- Settings Accordions --- */}
        {items.map((item, index) => (
          <View key={index}>
            <TouchableOpacity style={styles.item} onPress={() => toggleSection(index)}>
              <Text style={styles.itemText}>{item.title}</Text>
              <Ionicons
                name={activeSections[index] ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
            <Collapsible collapsed={!activeSections[index]}>
              {item.renderContent()}
            </Collapsible>
          </View>
        ))}

        {/* --- Logout --- */}
        <TouchableOpacity style={styles.logoutButton}>
          <Pressable onPress={() => router.push('../(auth)/welcome')}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e' },
  headerIcons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  profileSection: { alignItems: 'center', padding: 24 },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 4,
  },
  name: { fontSize: 20, fontWeight: '700', marginTop: 8, color: '#fff' },
  username: { color: '#ffd33d', fontSize: 14 },
  followWrapper: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 2,
  },
  followContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  followButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 20,
    paddingHorizontal: 50,
    paddingVertical: 10,
    marginHorizontal: 8,
  },
  followText: {
    color: '#000',
    fontWeight: 'bold',
  },
  profileInfoCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 1,
  },
  profileInfoTitle: {
    color: '#ffd33d',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputField: {
    backgroundColor: '#2c2c2e',
    color: '#fff',
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  label: {
    color: '#ffd33d',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
  },
  fitnessLevelButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  actionButtonActive: {
    backgroundColor: '#ffd33d',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtonTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderColor: '#25292e',
    backgroundColor: '#25292e',
  },
  itemText: { fontSize: 16, color: '#fff' },
  accordionContent: {
    flex: 1,
    textAlign: 'left',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#25292e',
    fontSize: 14,
    color: '#ffff',
  },
  logoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#d00',
    fontWeight: '500',
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#25292e',
    color: '#25292e',
  },
  switchLabel: {
    color: '#DA9E44',
  },
  switchRowSelected: {
    backgroundColor: '#DA9E44',
  },
});
