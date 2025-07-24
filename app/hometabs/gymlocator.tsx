import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, FlatList } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewCluster from 'react-native-map-clustering';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { useNavigation } from 'expo-router';
import { Modalize } from 'react-native-modalize';
import Collapsible from 'react-native-collapsible';

import { rawGyms, markerColors } from '../../gyms-data';

const gyms = Object.entries(rawGyms).flatMap(([brand, entries]) =>
  entries.map(gym => ({ ...gym, brand }))
);

export default function GymLocator() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const modalRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [collapsed, setCollapsed] = useState({});
  const [filteredGyms, setFilteredGyms] = useState(gyms);

  // Search gym by name
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredGyms(gyms);
    } else {
      setFilteredGyms(
        gyms.filter(gym =>
          gym.name.toLowerCase().includes(searchText.trim().toLowerCase())
        )
      );
    }
  }, [searchText]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Locate a Gym',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
    });

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      setLoadingLocation(false);
    })();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c) / 1000; // distance in km
  };

  const centerMapOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleMarkerPress = gym => {
    setSelectedGym(gym);
    modalRef.current?.open();
  };

  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  if (loadingLocation || !currentLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapViewCluster
        style={{ flex: 1 }}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {filteredGyms.map(gym => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: gym.lat, longitude: gym.lng }}
            pinColor={markerColors[gym.brand] || 'blue'}
            onPress={() => handleMarkerPress(gym)}
          />
        ))}
      </MapViewCluster>

      {/* Recenter Button */}
      <TouchableOpacity style={styles.recenterButton} onPress={centerMapOnUser}>
        <Text style={styles.recenterText}>🎯</Text>
      </TouchableOpacity>

      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search gym by name"
        placeholderTextColor="#ccc"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Modal for selected gym */}
      <Modalize ref={modalRef} adjustToContentHeight scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
        {selectedGym && (
          <View style={styles.modalContent}>
            <Text style={styles.gymName}>{selectedGym.name}</Text>
            <Text>{selectedGym.location}</Text>
            <Text>{selectedGym.brand}</Text>
            <Text>
              Distance:{' '}
              {calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                selectedGym.lat,
                selectedGym.lng
              ).toFixed(2)} km
            </Text>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => openInGoogleMaps(selectedGym.lat, selectedGym.lng)}
            >
              <Text style={styles.directionsText}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modalize>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  recenterButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  recenterText: {
    fontSize: 20,
  },
  searchBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    color: '#fff'
  },
  modalContent: {
    padding: 20,
  },
  gymName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6
  },
  directionsButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8
  },
  directionsText: {
    color: '#fff',
    textAlign: 'center',
  }
});
