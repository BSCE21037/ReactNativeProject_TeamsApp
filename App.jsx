import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StreamChat } from 'stream-chat';
import { ChatProvider } from 'stream-chat-react-native';
import MainScreen from './src/screens/MainScreen';

const App = () => {
    return (
        <View style={{ flex: 1 }}>
            <MainScreen />
        </View>
    );
};

export default App;