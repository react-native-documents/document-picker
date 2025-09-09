import * as React from 'react'
import { Text, View } from 'react-native'

export const Box = ({ children, label }: React.PropsWithChildren & { label: string }) => {
  return (
    <View
      style={{ borderWidth: 2, borderColor: 'black', padding: 10, borderRadius: 10, rowGap: 10 }}
    >
      <Text style={{ fontWeight: 'bold' }}>{label}</Text>
      {children}
    </View>
  )
}
