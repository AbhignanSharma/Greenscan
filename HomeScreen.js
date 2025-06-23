import React from 'react';
import { View, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View>
      <Button title="Banana" onPress={() => navigation.navigate('Plant', { plant: 'banana' })} />
      <Button title="Mango" onPress={() => navigation.navigate('Plant', { plant: 'mango' })} />
      <Button title="Tomato" onPress={() => navigation.navigate('Plant', { plant: 'tomato' })} />
    </View>
  );
}