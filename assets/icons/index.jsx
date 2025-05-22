import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Home from './Home'
import { theme } from '../../constants/themes'
import Backarrow from './Backarrow'

const icons = {
    home: Home,
    backarrow: Backarrow,
}

const Icon = ({name, ...props}) => {
    const IconComponent = icons[name];
  return (
    <IconComponent
        height={props.size || 24}
        width={props.size ||24}
        strokeWidth={props.strokeWidth || 1.9}
        color={theme.colors.textLight}
        {...props}
        />
  )
}

export default Icon;

const styles = StyleSheet.create({})