import { Link, useRouter } from 'expo-router';
import { Alert, Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';

export default function Index() {
  const screenHeight = Dimensions.get('window').height;
  const containerHeight = screenHeight / 10;
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.translucentWrapper, { height: containerHeight }]}>
        <View style={styles.row}>
          <View style={styles.buttonBox}>
            <Button title="Search" onPress={() => router.push('/hometabs/search')} />
          </View>
          <View style={styles.buttonBox}>
            <Button title="Gym Locator" onPress={() => router.push('/hometabs/gymlocator')} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.buttonBox}>
            <Button title="News" onPress={() => router.push('/hometabs/news')} />
          </View>
          <View style={styles.buttonBox}>
            <Button title="Chat" onPress={() => router.push('/hometabs/chat')} />
          </View>
        </View>
      </View>
      <Text style={styles.text}>Home screen</Text>
      <Link href="/about" style={styles.link}>
        Go to About screen
      </Link>
      
     
    </View>
    
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    color: '#fff',
  },
 link: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'space-evenly',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
  },
  buttonBox: {
    flex: 1,
    margin: 0,
    padding: 0,
    borderWidth: 1,
    borderColor: '#ffffff55',
    borderRadius:10,
    justifyContent: 'center',
   alignItems: 'center', 
  },
  translucentWrapper: {
  width: '100%',
  padding: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.1)', // translucent white
  borderColor: '#ffffff88', // translucent white border
  borderWidth: 1,
  borderRadius: 10,
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center'
},
});
