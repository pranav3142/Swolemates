import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLayoutEffect, useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigation } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { FlatList } from 'react-native-gesture-handler';
import * as Location from 'expo-location';

const markerColors = {
  ActiveSG: 'red',
  Anytime: 'purple',
  '24/7': '#40E0D0', // Tiffany Blue
  Snap: 'grey'
};

const rawGyms = {
  ActiveSG: [
    { id: 'asg1', name: 'Ang Mo Kio Swimming Complex', location: 'Ang Mo Kio', lat: 1.3702, lng: 103.8493 },
    { id: 'asg2', name: 'Bedok Stadium', location: 'Bedok', lat: 1.3239, lng: 103.9305 },
    { id: 'asg3', name: 'Bishan Stadium', location: 'Bishan', lat: 1.3509, lng: 103.8485 },
    { id: 'asg4', name: 'Bukit Batok Swimming Complex', location: 'Bukit Batok', lat: 1.3493, lng: 103.7496 },
    { id: 'asg5', name: 'Bukit Canberra', location: 'Sembawang', lat: 1.4484, lng: 103.8196 },
    { id: 'asg6', name: 'Choa Chu Kang Stadium', location: 'Choa Chu Kang', lat: 1.3851, lng: 103.7463 },
    { id: 'asg7', name: 'Clementi Stadium', location: 'Clementi', lat: 1.3122, lng: 103.7658 },
    { id: 'asg8', name: 'Delta Sports Centre', location: 'Redhill', lat: 1.2914, lng: 103.8239 },
    { id: 'asg9', name: 'Hougang Stadium', location: 'Hougang', lat: 1.3730, lng: 103.8926 },
    { id: 'asg10', name: 'Heartbeat @ Bedok', location: 'Bedok', lat: 1.3270, lng: 103.9286 },
    { id: 'asg11', name: 'Jurong East Stadium', location: 'Jurong East', lat: 1.3366, lng: 103.7396 },
    { id: 'asg12', name: 'Jurong West Stadium', location: 'Jurong West', lat: 1.3398, lng: 103.7056 },
    { id: 'asg13', name: 'Pasir Ris Sports Centre', location: 'Pasir Ris', lat: 1.3734, lng: 103.9496 },
    { id: 'asg14', name: 'Our Tampines Hub', location: 'Tampines', lat: 1.3530, lng: 103.9402 },
    { id: 'asg15', name: 'Sengkang Sports Centre', location: 'Sengkang', lat: 1.3900, lng: 103.8946 },
    { id: 'asg16', name: 'Toa Payoh Sports Hall', location: 'Toa Payoh', lat: 1.3364, lng: 103.8503 },
    { id: 'asg17', name: 'Woodlands Stadium', location: 'Woodlands', lat: 1.4361, lng: 103.7865 },
    { id: 'asg18', name: 'Yishun Sports Hall', location: 'Yishun', lat: 1.4282, lng: 103.8382 },
  ],
  Anytime: [
  { id: 'af1', name: 'Anytime Fitness – NEX Serangoon', location: 'Serangoon', lat: 1.3500, lng: 103.8730, brand: 'Anytime' },
  { id: 'af2', name: 'Anytime Fitness – Clementi City', location: 'Clementi', lat: 1.3150, lng: 103.7640, brand: 'Anytime' },
  { id: 'af3', name: 'Anytime Fitness – HillV2 Bukit Batok', location: 'Bukit Batok', lat: 1.3510, lng: 103.7700, brand: 'Anytime' },
  { id: 'af4', name: 'Anytime Fitness – Northshore Plaza', location: 'Punggol', lat: 1.4110, lng: 103.9000, brand: 'Anytime' },
  { id: 'af5', name: 'Anytime Fitness – Tiong Bahru Plaza', location: 'Tiong Bahru', lat: 1.2860, lng: 103.8300, brand: 'Anytime' },
  { id: 'af6', name: 'Anytime Fitness – Jurong Point', location: 'Jurong West', lat: 1.3490, lng: 103.7070, brand: 'Anytime' },
  { id: 'af7', name: 'Anytime Fitness – Nanyang CC', location: 'Jurong West', lat: 1.3495, lng: 103.6910, brand: 'Anytime' },
  { id: 'af8', name: 'Anytime Fitness – NUS', location: 'Kent Ridge', lat: 1.2966, lng: 103.7764, brand: 'Anytime' },
  { id: 'af9', name: 'Anytime Fitness – Novena', location: 'Novena', lat: 1.3110, lng: 103.8449, brand: 'Anytime' },
  { id: 'af10', name: 'Anytime Fitness – Wisteria Mall', location: 'Yishun', lat: 1.4320, lng: 103.8350, brand: 'Anytime' },
  { id: 'af11', name: 'Anytime Fitness – Northpoint City', location: 'Yishun', lat: 1.4380, lng: 103.785, brand: 'Anytime' },
  { id: 'af12', name: 'Anytime Fitness – Downtown East', location: 'Pasir Ris', lat: 1.3730, lng: 103.9450, brand: 'Anytime' },
  { id: 'af13', name: 'Anytime Fitness – HarbourFront', location: 'HarbourFront', lat: 1.2650, lng: 103.8220, brand: 'Anytime' },
  { id: 'af14', name: 'Anytime Fitness – Eastpoint Mall', location: 'Simei', lat: 1.3430, lng: 103.9550, brand: 'Anytime' },
  { id: 'af15', name: 'Anytime Fitness – Balestier', location: 'Balestier', lat: 1.3190, lng: 103.8450, brand: 'Anytime' },
  ],
  '24/7': [
  { id: '2471', name: '24/7 Fitness – Bishan CC', location: 'Bishan', lat: 1.3490, lng: 103.8510, brand: '24/7' },
  { id: '2472', name: '24/7 Fitness – Canberra Plaza', location: 'Sembawang', lat: 1.4470, lng: 103.8190, brand: '24/7' },
  { id: '2473', name: '24/7 Fitness – Ci Yuan CC', location: 'Hougang', lat: 1.3910, lng: 103.8940, brand: '24/7' },
  { id: '2474', name: '24/7 Fitness – Elias Mall', location: 'Pasir Ris', lat: 1.3730, lng: 103.9490, brand: '24/7' },
  { id: '2475', name: '24/7 Fitness – Fernvale CC', location: 'Sengkang', lat: 1.3900, lng: 103.8940, brand: '24/7' },
  { id: '2476', name: '24/7 Fitness – Keat Hong CC', location: 'Choa Chu Kang', lat: 1.3840, lng: 103.7450, brand: '24/7' },
  { id: '2477', name: '24/7 Fitness – Margaret Market', location: 'Queenstown', lat: 1.2940, lng: 103.8210, brand: '24/7' },
  { id: '2478', name: '24/7 Fitness – Orchard (Pacific Plaza)', location: 'Orchard', lat: 1.3040, lng: 103.8320, brand: '24/7' },
  { id: '2479', name: '24/7 Fitness – Tampines North CC', location: 'Tampines', lat: 1.3540, lng: 103.9450, brand: '24/7' },
  { id: '24710', name: '24/7 Fitness – The Cathay', location: 'Dhoby Ghaut', lat: 1.2970, lng: 103.8450, brand: '24/7' },
  { id: '24711', name: '24/7 Fitness – Vista Point', location: 'Woodlands', lat: 1.4320, lng: 103.7870, brand: '24/7' }
  ],
  Snap: [
  { id: 'sf1', name: 'Snap Fitness – Woodlands Woods Square', location: 'Woodlands', lat: 1.4330, lng: 103.7865, brand: 'Snap' },
  { id: 'sf2', name: 'Snap Fitness – Pasir Ris Central', location: 'Pasir Ris', lat: 1.3730, lng: 103.9450, brand: 'Snap' },
  { id: 'sf3', name: 'Snap Fitness – Prinsep Street', location: 'City Hall', lat: 1.2970, lng: 103.8490, brand: 'Snap' },
  { id: 'sf4', name: 'Snap Fitness – Anchorpoint', location: 'Bukit Merah', lat: 1.2760, lng: 103.8230, brand: 'Snap' },
  { id: 'sf5', name: 'Snap Fitness – Toa Payoh', location: 'Toa Payoh', lat: 1.3340, lng: 103.8450, brand: 'Snap' },
  { id: 'sf6', name: 'Snap Fitness – Pasir Ris Mall', location: 'Pasir Ris', lat: 1.3740, lng: 103.9455, brand: 'Snap' },
  ]
};

const gyms = Object.entries(rawGyms).flatMap(([brand, entries]) =>
  entries.map(gym => ({ ...gym, brand }))
);

export default function GymLocator() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const sheetRef = useRef(null);

  const [selectedGym, setSelectedGym] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Locate a Gym',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R) / 1000;
  };

  const findNearestGym = useCallback(() => {
    if (!currentLocation) return null;
    return gyms.reduce((best, gym) => {
      const d = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        gym.lat,
        gym.lng
      );
      return !best || d < best.dist ? { gym, dist: d } : best;
    }, null)?.gym;
  }, [currentLocation]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location access for this feature.');
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLoadingLocation(false);
    })();
  }, []);

  useEffect(() => {
    if (!loadingLocation && currentLocation) {
      const nearest = findNearestGym();
      const region = nearest
        ? { latitude: nearest.lat, longitude: nearest.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }
        : { latitude: currentLocation.latitude, longitude: currentLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };
      mapRef.current?.animateToRegion(region, 1000);
      if (nearest) {
        setSelectedGym(nearest);
        sheetRef.current?.expand();
      }
    }
  }, [loadingLocation, currentLocation, findNearestGym]);

  const handleMarkerPress = gym => {
    setSelectedGym(gym);
    mapRef.current?.animateToRegion({ latitude: gym.lat, longitude: gym.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    sheetRef.current?.expand();
  };

  const snapPoints = useMemo(() => ['20%', '50%', '80%'], []);
  const handleSheetChange = index => { if (index < 0) setSelectedGym(null); };

  if (loadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Fetching your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 1.3521,
          longitude: currentLocation?.longitude || 103.8198,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}
        {gyms.map(gym => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: gym.lat, longitude: gym.lng }}
            title={gym.name}
            description={gym.location}
            pinColor={markerColors[gym.brand] || 'white'}
            onPress={() => handleMarkerPress(gym)}
          />
        ))}
      </MapView>

      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: '#1c1c1e' }}
        handleIndicatorStyle={{ backgroundColor: '#888' }}
        onChange={handleSheetChange}
      >
        <View style={styles.sheetContent}>
          {selectedGym ? (
            <>
              <Text style={styles.selectedGymName}>{selectedGym.name}</Text>
              <Text style={styles.selectedGymLocation}>{selectedGym.location}</Text>
              <TouchableOpacity onPress={() => Alert.alert('Directions', `Maps to ${selectedGym.name}?`)} style={styles.directionsButton}>
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sheetTitle}>Nearby Gyms</Text>
              <FlatList
                data={gyms}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.card} onPress={() => handleMarkerPress(item)}>
                    <Text style={styles.gymName}>{item.name}</Text>
                    <Text style={styles.gymLocation}>{item.location}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25292e'
  },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  sheetContent: { flex: 1, padding: 15 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  card: { backgroundColor: '#2c2c2e', padding: 15, borderRadius: 10, marginBottom: 10 },
  gymName: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  gymLocation: { fontSize: 14, color: '#aaa' },
  selectedGymName: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  selectedGymLocation: { fontSize: 18, color: '#aaa', marginBottom: 20 },
  directionsButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  directionsButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
