import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigation } from 'expo-router';

export default function GymLocator() {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const [gyms, setGyms] = useState([
    { id: '1', name: 'Iron Temple', lat: 1.3521, lng: 103.8198 },
    { id: '2', name: 'Beast Gym', lat: 1.3556, lng: 103.8670 },
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Locate a Gym',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const centerMap = (lat, lng) => {
    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 1.3521,
          longitude: 103.8198,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {gyms.map(gym => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: gym.lat, longitude: gym.lng }}
            title={gym.name}
          />
        ))}
      </MapView>

      <View style={styles.listContainer}>
        <FlatList
          data={gyms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => centerMap(item.lat, item.lng)}
            >
              <Text style={{ color: 'white' }}>{item.name}</Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#1c1c1e',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
});
