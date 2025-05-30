import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import Icon from '../../assets/icons'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import Input from '../../components/Input'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/themes'
import { hp, wp } from '../../helpers/common'

import auth from '@react-native-firebase/auth'

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Login Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      // If login is successful, navigate to the home screen
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error("Firebase Login Error:", error);
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'The email address is invalid.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This user account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-credential': // Generic for invalid email/password combinations
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = error.message; // Fallback to Firebase's message
        }
      }
      Alert.alert('Login Failed', errorMessage);
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
        <Text style={styles.welcomeText}>Hey,</Text>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        </View>

{/* form  */}
      <View style={styles.form}> 
        <Text style={{fontSize: hp(1.5), color:theme.colors.text}}>
          Please login to continue
        </Text>
        <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder='Enter your email'
             onChangeText={setEmail}
            value={email}
        />
        <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder='Enter your password'
            secureTextEntry
             onChangeText={setPassword}
            value={password}
        />
        <Text style={styles.forgotPassword}>
          Forgot Password?
        </Text>
        {/* button  */}
        <Button title={'Login'} loading={loading} onPress={handleLogin} />
      </View>

      {/* footer  */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
        Don't have an account?
        </Text>
        <Pressable onPress={()=> router.push('signUp')}>
          <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Sign up</Text>
        </Pressable>
      </View>
    </View>


    </ScreenWrapper>
  )
}

export default Login

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
    color: theme.colors.text,
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