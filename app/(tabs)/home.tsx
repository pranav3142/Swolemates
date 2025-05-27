import React from 'react'; 
import { Dimensions, StyleSheet, Text, View, ImageBackground, Pressable } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

type RoutePath = '/hometabs/search' | '/hometabs/gymlocator' | '/hometabs/news' | '/hometabs/chat';

const data: { title: string; path: RoutePath; image: any }[] = [
  { title: 'Search', path: '/hometabs/search', image: require('../../assets/images/gympeople.png') },
  { title: 'Gym Locator', path: '/hometabs/gymlocator', image: require('../../assets/images/gymmap.png') },
  { title: 'News', path: '/hometabs/news', image: require('../../assets/images/gymnews.jpg') },
  { title: 'Chat', path: '/hometabs/chat', image: require('../../assets/images/chat.png') },
];


export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Carousel
        
        width={screenWidth * 0.85}
        height={220}
        data={data}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
          parallaxAdjacentItemScale: 0.75,
        }}
        scrollAnimationDuration={1000}
        renderItem={({ item, index, animationValue }) => {
          

          return (
              <ImageBackground source={item.image} style={styles.image} imageStyle={styles.imageRadius}>
                <View style={styles.overlay}>
                  <Pressable onPress={() => router.push(item.path)} hitSlop={10}>
                    <Text style={styles.title}>{item.title}</Text>
                  </Pressable>
                </View>
              </ImageBackground>
          );
        }}
      />
      
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#25292e',
  justifyContent: 'flex-start',
  alignItems: 'center',
  //paddingVertical: 0,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  pressable: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 220,
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderRadius: 16,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  title: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
