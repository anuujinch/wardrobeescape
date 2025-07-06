import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="mirror-camera" 
        options={{ 
          title: 'Mirror Camera',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="wardrobe-assessment" 
        options={{ 
          title: 'Wardrobe Assessment',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}