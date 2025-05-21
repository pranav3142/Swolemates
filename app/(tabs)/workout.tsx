import { Link, useRouter} from 'expo-router';
import { Alert, Button, Dimensions, StyleSheet, Text, View } from 'react-native';


export default function AboutScreen() {
  const screenHeight = Dimensions.get('window').height;
  const containerHeight = screenHeight / 10;
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={[styles.translucentWrapper, { height: containerHeight }]}>
              <View style={styles.row}>
                <View style={styles.buttonBox}>
                  <Button title="Start Workout" onPress={() => router.push('/workouttabs/startworkout')} />
                </View>
              
              </View>
              <View style={styles.row}>
                <View style={styles.buttonBox}>
                  <Button title="Workout generator" onPress={() => router.push('/workouttabs/workoutgen')} />
                </View>
                <View style={styles.buttonBox}>
                  <Button title="Exercises" onPress={() => router.push('/workouttabs/exercises')} />
                </View>
              </View>
            </View>
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

