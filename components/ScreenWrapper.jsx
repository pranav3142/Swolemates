import { View, Text } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ScreenWrapper = ({children, bg}) => {

    const {top} = 0;
    const paddingTop = top>0? top+5: 10; //was 30
  return (
    <View style={{flex: 1, paddingTop, backgroundColor: bg}}>
        {
         children
        }
    </View>
  )
}

export default ScreenWrapper