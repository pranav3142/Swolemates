import ScreenWrapper from '@/components/ScreenWrapper'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Button from '../../components/Button'
import { theme } from '../../constants/themes'
import { hp, wp } from '../../helpers/common'

const welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper bg="#25292e">
      <StatusBar style ="dark" />
      <View style ={styles.container}>
        {/* welcome image */}
        <Image style={styles.welcomeImage} resizeMode='contain' source={require('../../assets/images/SLogo.png')} />

        {/* title  */}
        <View style={{gap: 20}}>
          <Text style={styles.title}>Swolemates</Text>
          <Text style={styles.punchline}>
            Where Gains meet Goals
          </Text>
        </View>
        {/* footer  */}
        <View style={styles.footer}>
          <Button
            title="Getting Started"
            buttonStyle={{marginHorizontal: wp(3)}}
            onPress={()=> router.push('signUp')}
          />
          <View style={styles.bottomTextContainer}>
            <Text style={styles.loginText}>
              Already have an account!
            </Text>
            <Pressable onPress={()=> router.push('login')}>
              <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
                Login
              </Text>
            </Pressable>
          </View>
        </View>
    </View>
    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#25292e',
    paddingHorizontal: wp(10),
    gap: hp(1)
  },
  welcomeImage: {
    height: hp(60),
    width: wp(100),
    alignSelf: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(5),
    textAlign: 'center',
    fontWeight: theme.fonts.extraBold
  },
  punchline: {
    textAlign: 'center',
    paddingHorizontal: wp(10),
    fontSize: hp(1.9),
    color: theme.colors.text,
    paddingBottom: 15,
  },
  footer: {
    gap: 30,
    width: '100%'
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  loginText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.8)
  }
})