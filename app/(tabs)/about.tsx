import { theme } from '@/constants/themes';
import { hp } from '@/helpers/common';
import { router } from 'expo-router';
import { Text, View, StyleSheet, Pressable } from 'react-native';


export default function AboutScreen() {
  return (
    <View style={styles.container}>
        <Pressable onPress={()=> router.push('../(auth)/welcome')}>
       <Text style={styles.text}>Logout</Text>        
        </Pressable>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'flex-end',
    paddingBottom: hp(2),
    alignItems: 'center',
  },
  text: {
    color: '#ffd33d',
    fontSize: hp(2.6),
  },
});




// import { Text, View, StyleSheet } from 'react-native';

// export default function AboutScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Logout</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#25292e',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     color: '#fff',
//   },
// });
