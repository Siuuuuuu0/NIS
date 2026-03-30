import React from 'react';
import { ExpoRoot } from 'expo-router';

// Ensures Expo Router works even if App.js is used as entry.
const ctx = require.context('./app');

export default function App() {
  return <ExpoRoot context={ctx} />;
}
