// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen 
        name="mirror-camera" 
        options={{ 
          title: 'Mirror Camera',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="wardrobe-assessment" 
        options={{ title: 'Wardrobe Assessment' }} 
      />
    </Stack>
  );
}