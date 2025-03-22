import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import MainScreen from './screens/MainScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
    return(
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Main" component={MainScreen} />
        </Stack.Navigator>
    );
};

export default RootNavigator;




