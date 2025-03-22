import React, {useState} from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import CustomTextInput from "../components/CustomSignIn";
import CustomPressable from "../components/CustomWelcome";

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return(
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Welcome Back!</Text>
            
            {/* Social Login Button */}
            <CustomPressable
                title="CONTINUE WITH GOOGLE"
                onPress={() => {}}
                style={[styles.socialButton, styles.googleButton]}
                textStyle={[styles.socialButtonText, styles.googleText]}
            />

            <Text style={styles.orText}>OR LOG IN WITH EMAIL</Text>

            {/* Email and Password Inputs */}
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

            {/* Login Button */}
            <CustomPressable
                title="LOG IN"
                onPress={() => navigation.navigate('Main')}
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
        </View>
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
});

export default SignInScreen;