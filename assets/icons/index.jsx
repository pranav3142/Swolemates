import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Home from './Home'
import { theme } from '../../constants/themes'
import Backarrow from './Backarrow'
import Lock from './Lock'
import Mail from './Mail'
import User from './User'

const icons = {
    home: Home,
    backarrow: Backarrow,
    lock: Lock,
    mail: Mail,
    user: User
}

const Icon = ({name, ...props}) => {
    const IconComponent = icons[name];
  return (
    <IconComponent
        height={props.size || 24}
        width={props.size ||24}
        strokeWidth={props.strokeWidth || 1.9}
        color={theme.colors.text}
        {...props}
        />
  )
}

export default Icon;