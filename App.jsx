import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StreamChat } from 'stream-chat';
import { ChatProvider } from 'stream-chat-react-native';
import MainScreen from './src/screens/MainScreen';
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/RootNavigator";

const App = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default App;