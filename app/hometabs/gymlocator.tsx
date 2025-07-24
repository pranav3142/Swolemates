import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';
import { openURL } from 'expo-linking';
import { Modalize } from 'react-native-modalize';

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
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [brandFilters, setBrandFilters] = useState({
    ActiveSG: true,
    Anytime: true,
    '24/7': true,
    Snap: true
  });

  useEffect(() => {
    navigation.setOptions({
      title: 'Locate a gym',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
    });
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    })();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestGym = useCallback(() => {
    if (!currentLocation) return;
    const filteredGyms = gyms.filter(g => brandFilters[g.brand]);
    const best = filteredGyms.reduce((prev, gym) => {
      const dist = calculateDistance(currentLocation.latitude, currentLocation.longitude, gym.lat, gym.lng);
      return !prev || dist < prev.dist ? { gym, dist } : prev;
    }, null);
    if (best && best.gym && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: best.gym.lat,
        longitude: best.gym.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setSelectedGym(best.gym);
      const dist = best.dist.toFixed(2);
      setSearchResults([{ ...best.gym, distance: dist }]);
      modalRef.current?.open();
    }
  }, [currentLocation, brandFilters]);

  const handleSearch = () => {
    const filtered = gyms.filter(g =>
      g.name.toLowerCase().includes(searchText.toLowerCase()) && brandFilters[g.brand]
    );
    setSearchResults(filtered);
    modalRef.current?.open();
    Keyboard.dismiss();
  };

  const handleResultSelect = gym => {
    modalRef.current?.close();
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: gym.lat,
        longitude: gym.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    setSelectedGym(gym);
  };

  const toggleBrand = (brand) => {
    setBrandFilters(prev => ({ ...prev, [brand]: !prev[brand] }));
  };

  const handleMarkerLongPress = (gym) => {
    const dist = calculateDistance(currentLocation.latitude, currentLocation.longitude, gym.lat, gym.lng).toFixed(2);
    setSelectedGym(gym);
    setSearchResults([{ ...gym, distance: dist }]);
    modalRef.current?.open();
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 1.3521,
          longitude: 103.8198,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {gyms.filter(g => brandFilters[g.brand]).map(gym => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: gym.lat, longitude: gym.lng }}
            title={gym.name}
            description={gym.location}
            pinColor={markerColors[gym.brand] || 'blue'}
            onPress={() => setSelectedGym(gym)}
            onLongPress={() => handleMarkerLongPress(gym)}
          />
        ))}
      </MapView>

      <View style={styles.controlRow}>
        {Object.keys(brandFilters).map(brand => (
          <TouchableOpacity key={brand} onPress={() => toggleBrand(brand)} style={[styles.filterButton, !brandFilters[brand] && styles.filterDisabled]}>
            <Text style={{ color: '#fff' }}>{brand}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.locateButtonInline} onPress={findNearestGym}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>📍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search gym by name..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
      </View>

      <Modalize
        ref={modalRef}
        flatListProps={{
          data: searchResults,
          keyExtractor: (item) => item.id,
          ListHeaderComponent: () => (
            <View style={{ padding: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Search Results</Text>
            </View>
          ),
          renderItem: ({ item }) => (
            <TouchableOpacity onPress={() => handleResultSelect(item)} style={{ padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
              <Text style={{ color: 'gray' }}>{item.location}</Text>
              {item.distance && <Text style={{ color: 'gray' }}>{item.distance} km away</Text>}
              <TouchableOpacity
                onPress={() => openURL(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`)}
                style={{ marginTop: 8, backgroundColor: '#25292e', padding: 8, borderRadius: 6 }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>Open in Google Maps</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 5,
  },
  searchInput: {
    height: 40,
  },
  locateButtonInline: {
    backgroundColor: '#25292e',
    padding: 8,
    borderRadius: 20,
    marginLeft: 5
  },
  controlRow: {
    position: 'absolute',
    bottom: 70,
    left: 10,
    right: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterButton: {
    backgroundColor: '#25292e',
    padding: 8,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginVertical: 2
  },
  filterDisabled: {
    backgroundColor: 'grey'
  }
});