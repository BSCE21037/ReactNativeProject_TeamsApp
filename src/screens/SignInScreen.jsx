import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native";
import CustomTextInput from "../components/CustomSignIn";
import CustomPressable from "../components/CustomWelcome";
import { commonStyles } from '../styles';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, WEB_CLIENT_ID, db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Buffer } from 'buffer';
import axios from 'axios';

// Polyfill Buffer if not available
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [jiraToken, setJiraToken] = useState("");
    const [showJiraFields, setShowJiraFields] = useState(false);
    const [isConnectingToJira, setIsConnectingToJira] = useState(false);
    const [jiraConnected, setJiraConnected] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
          webClientId: WEB_CLIENT_ID,
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });
        
        // Check if we already have Jira credentials
        // checkExistingJiraCredentials();
      }, []);

      const checkExistingJiraCredentials = async () => {
        try {
            // const token = await AsyncStorage.getItem('jiraToken');
            // const email = await AsyncStorage.getItem('email');
            const token = null;
            const email = null;
            console.log('in checkExistingJiraCredentials , Jira Token:', token);
            console.log('in checkExistingJiraCredentials , Jira Email:', email);
            return { token, email }; // Always returns an object
        } catch (error) {
            console.log('Error checking Jira credentials:', error);
            return { token: null, email: null }; // Return null values if error occurs
        }
    };

    
    const handlePress = async () => {
        if (!email || !password) {
            Alert.alert('Error','Please fill in all fields.');
            return;
        }
    
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // console.log('User Signed In: ', userCredential);
            
            // Check if we have Jira credentials
            const credentials = await checkExistingJiraCredentials();
            
            if (!credentials.token || !credentials.email) {
                Alert.alert(
                    'Info', 
                    'You can connect to Jira now or later in settings',
                    [
                        {text: 'Connect Now', onPress: () => testJiraConnection(email, jiraToken)},
                        {text: 'Later', onPress: () => navigation.navigate("Main")}
                    ]
                );
            } else {
                navigation.navigate("Main");
            }
        } catch (error) {
            console.log(error.message);
            
            let errorMessage = "Login failed. Please try again.";
            switch (error.code) {
                case "auth/invalid-email":
                    errorMessage = "Please enter a valid email address.";
                    break;
                case "auth/user-not-found":
                case "auth/wrong-password":
                    errorMessage = "Invalid email or password.";
                    break;
                case "auth/too-many-requests":
                    errorMessage = "Too many attempts. Please try again later.";
                    break;
            }
            
            Alert.alert("Error", errorMessage);
        }
    };

    const testJiraConnection = async (email, token) => {
        try {
            if (!email || !token) {
                throw new Error('Email and token are required');
            }

            const base64 = Buffer.from(`${email}:${token}`).toString('base64');
            const response = await axios.get(
                'https://teamsapp.atlassian.net/rest/api/2/myself',
                {
                    headers: {
                        'Authorization': `Basic ${base64}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Jira Connection Test Response:', response.data);
            await AsyncStorage.setItem('jiraToken', token);
            await AsyncStorage.setItem('email', email);
            console.log('email:', email);
            console.log('token:', token);
            navigation.navigate("Main");
            return response.data;
        } catch (error) {
            console.error('Jira Connection Test Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            let errorMessage = 'Failed to connect to Jira';
            if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please check your email and API token.';
            } else if (error.response?.data?.errorMessages) {
                errorMessage = error.response.data.errorMessages.join('\n');
            }
            
            throw new Error(errorMessage);
        }
    };

    const handleJiraConnect = async () => {
        if (!email || !jiraToken) {
            Alert.alert('Error', 'Please enter both email and API token');
            return;
        }

        setIsConnectingToJira(true);
        
        try {
            // Test the connection first
            await testJiraConnection(email, jiraToken);
            
            // If successful, store the credentials
            await AsyncStorage.setItem('jiraToken', jiraToken);
            await AsyncStorage.setItem('email', email);
            console.log('Jira credentials saved successfully!');
            
            setJiraConnected(true);
            Alert.alert('Success', 'Jira connection successful!');
            setShowJiraFields(false);
            
            // Navigate to main screen after successful connection
            navigation.navigate("Main");
        } catch (error) {
            Alert.alert('Jira Connection Error', error.message);
        } finally {
            setIsConnectingToJira(false);
        }
    };



    return(
        <LinearGradient 
            colors={['#FF0000', '#00FF00']}
            style={commonStyles.container}
        >
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Welcome Back!</Text>
            
            <CustomPressable
                title={
                    <View style={styles.googleButtonContent}>
                        <Icon name="google" size={20} color="#8B3535" style={styles.googleIcon} />
                        <Text style={styles.googleText}>CONTINUE WITH GOOGLE</Text>
                    </View>
                }
                style={[styles.socialButton, styles.googleButton]}
                textStyle={[styles.socialButtonText, styles.googleText]}
            />

            <Text style={styles.orText}>OR LOG IN WITH EMAIL</Text>

            <CustomTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                style={styles.inputContainer}
                inputStyle={styles.input}
            />
            <CustomTextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={true}
                style={styles.inputContainer}
                inputStyle={styles.input}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />

            <CustomTextInput
                            value={jiraToken}
                            onChangeText={setJiraToken}
                            placeholder="API TOKEN"
                            secureTextEntry={true}
                            style={styles.inputContainer}
                            inputStyle={styles.input}
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        />

            <CustomPressable
                title="LOG IN"
                onPress={handlePress}
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
            />

            <TouchableOpacity onPress={() => {}}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>DON'T HAVE AN ACCOUNT? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signupLink}>SIGN UP</Text>
                </TouchableOpacity>
            </View>

            {/* {!showJiraFields ? (
                <TouchableOpacity 
                    style={[
                        styles.jiraConnectButton,
                        jiraConnected && styles.jiraConnectedButton
                    ]}
                    onPress={() => setShowJiraFields(true)}
                >
                    {jiraConnected ? (
                        <Text style={styles.jiraConnectText}>
                            <Icon name="check" size={16} color="white" /> Jira Connected
                        </Text>
                    ) : (
                        <Text style={styles.jiraConnectText}>Connect to Jira</Text>
                    )}
                </TouchableOpacity>
            ) : (
                <View style={styles.jiraContainer}>
                    <Text style={styles.jiraTitle}>Connect to Jira</Text>
                    
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Jira Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                    
                    
                    <View style={styles.jiraButtonRow}>
                        <TouchableOpacity 
                            style={[styles.jiraButton, styles.jiraCancelButton]}
                            onPress={() => setShowJiraFields(false)}
                            disabled={isConnectingToJira}
                        >
                            <Text style={styles.jiraButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.jiraButton, styles.jiraConnectButton]}
                            onPress={handleJiraConnect}
                            disabled={isConnectingToJira}
                        >
                            {isConnectingToJira ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.jiraButtonText}>Connect</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )} */}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#2E5339', // Forest green background
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
        padding: 5,
    },
    backButtonText: {
        fontSize: 24,
        color: '#fff', // Changed to white for better contrast
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 80,
        marginBottom: 30,
        color: '#fff', // Changed to white
    },
    socialButton: {
        width: '100%',
        padding: 15,
        borderRadius: 25,
        marginBottom: 15,
        alignItems: 'center',
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#8B3535', // Deep red border
    },
    socialButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    googleText: {
        color: '#8B3535', // Deep red text
    },
    orText: {
        color: '#fff', // Changed to white
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 14,
    },
    inputContainer: {
        marginBottom: 15,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
        borderWidth: 1,
        borderColor: '#8B3535', // Deep red border
        height: 60,
        justifyContent: 'center',
    },
    input: {
        padding: 15,
        fontSize: 16,
        color: '#fff', // Changed to white
        height: '100%',
        textAlignVertical: 'center',
    },
    loginButton: {
        backgroundColor: '#8B3535', // Deep red button
        width: '100%',
        padding: 15,
        borderRadius: 25,
        marginTop: 20,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    forgotPassword: {
        color: '#fff', // Changed to white
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    signupText: {
        color: '#fff', // Changed to white
        fontSize: 14,
    },
    signupLink: {
        color: '#8B3535', // Deep red link
        fontSize: 14,
        fontWeight: '700',
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIcon: {
        marginRight: 10,
    },
    jiraConnectButton: {
        backgroundColor: '#0052CC',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    jiraConnectText: {
        color: 'white',
        fontWeight: 'bold',
    },
    jiraContainer: {
        width: '100%',
        marginTop: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 10,
        padding: 15,
    },
    jiraTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    jiraButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    jiraButton: {
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    jiraConnectButton: {
        backgroundColor: '#0052CC',
    },
    jiraCancelButton: {
        backgroundColor: '#666',
    },
    jiraButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    jiraConnectedButton: {
        backgroundColor: '#4CAF50',
    },
    jiraInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#616061',
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        marginBottom: 12,
        color: 'white',
    },
});

export default SignInScreen;