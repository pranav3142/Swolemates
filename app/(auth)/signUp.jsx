import { Alert, StyleSheet, Text, View, Pressable, TextInput } from 'react-native'
import React, {useRef, useState} from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import {theme} from '../../constants/themes'
import Icon from '../../assets/icons'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import { wp, hp } from '../../helpers/common'
import Input from '../../components/Input'

import auth from '@react-native-firebase/auth';

const SignUp = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Include name validation if desired, though Firebase Auth only uses email/password for creation
    if (!name || !email || !password) {
      Alert.alert('Sign Up Error', 'Please fill all the fields!');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      await userCredential.user.updateProfile({
        displayName: name,
      });

      Alert.alert('Success', 'Account created and signed in!');
      // After successful signup, navigate to the home screen
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error("Firebase Sign Up Error:", error);
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'The email address is invalid.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email address is already in use!';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. It must be at least 6 characters.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = error.message; // Fallback to Firebase's message
        }
      }
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScreenWrapper bg="#25292e">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

      {/* welcome  */}
        <View>
        <Text style={styles.welcomeText}>Let's</Text>
        <Text style={styles.welcomeText}>Get Started</Text>
        </View>

{/* form  */}
      <View style={styles.form}> 
        <Text style={{fontSize: hp(1.5), color:theme.colors.text}}>
          Please fill in the details to create an account
        </Text>
        <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder='Enter your name'
            onChangeText={setName}
            value={name}
        />
        <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder='Enter your email'
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
        />
        <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder='Enter your password'
            secureTextEntry
            onChangeText={setPassword}
            value={password}
        />
    
        {/* button  */}
        <Button title={'Sign Up'} loading={loading} onPress={handleSignUp} />
      </View>

      {/* footer  */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
        Already have an account!
        </Text>
        <Pressable onPress={()=> router.push('login')}>
          <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Login</Text>
        </Pressable>
      </View>
    </View>


    </ScreenWrapper>
  )
}

export default SignUp

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
    paddingHorizontal: wp(5),
    paddingTop: wp(15),
  },
  welcomeText:{
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6)
  } 
})