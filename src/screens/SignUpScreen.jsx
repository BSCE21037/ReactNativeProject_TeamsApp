import React, {useState} from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import CustomTextInput from "../components/CustomSignIn";
import CustomPressable from "../components/CustomWelcome";

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);

    return(
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create your account</Text>
            
            {/* Social Login Button */}
            <CustomPressable
                title="CONTINUE WITH GOOGLE"
                onPress={() => {}}
                style={[styles.socialButton, styles.googleButton]}
                textStyle={[styles.socialButtonText, styles.googleText]}
            />

            <Text style={styles.orText}>OR LOG IN WITH EMAIL</Text>

            {/* Input Fields */}
            <CustomTextInput
                value={name}
                onChangeText={setName}
                placeholder="Name"
                style={styles.inputContainer}
                inputStyle={styles.input}
            />
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

            {/* Privacy Policy Checkbox */}
            <View style={styles.privacyContainer}>
                <TouchableOpacity 
                    style={styles.checkbox}
                    onPress={() => setIsPrivacyAccepted(!isPrivacyAccepted)}
                >
                    {isPrivacyAccepted && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.privacyText}>
                    I have read the <Text style={styles.privacyLink}>Privacy Policy</Text>
                </Text>
            </View>

            {/* Sign Up Button */}
            <CustomPressable
                title="GET STARTED"
                onPress={() => navigation.navigate('Main')}
                style={styles.signupButton}
                textStyle={styles.signupButtonText}
            />
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
        color: '#fff', // Changed to white
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
    privacyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#8B3535', // Deep red border
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
    },
    checkmark: {
        color: '#8B3535', // Deep red checkmark
        fontSize: 14,
    },
    privacyText: {
        color: '#fff', // Changed to white
        fontSize: 14,
    },
    privacyLink: {
        color: '#8B3535', // Deep red link
        textDecorationLine: 'underline',
    },
    signupButton: {
        backgroundColor: '#8B3535', // Deep red button
        width: '100%',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default SignUpScreen;
