import React, {useState} from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import CustomTextInput from "../components/CustomSignIn";
import CustomPressable from "../components/CustomWelcome";
import { commonStyles } from '../styles'; // Adjust the path as necessary
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for the Google icon
import { auth } from "./../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "./../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);

    const handleSignUp = async () => {
        if (!isPrivacyAccepted) {
            Alert.alert("Privacy Policy", "Please read and accept the Privacy Policy to continue.");
            return;
        }
        if (!password || !email || !name) {
            console.log("NOt Properly Entered");
            Alert.alert("Enter All Entries!");
            return;
        }

        try {
            console.log("Trying to create user");
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert("Success", "Account created successfully!");
            console.log("Successfully REgistered IN");
            navigation.navigate("Main");
            await setDoc(doc(db, "users", email), {
                email: email,
                name: name,
                selectedTopics: [],
            });
            

            //   navigation.navigate("Login"); // Navigate to login page
        } catch (error) {
            console.log(error.message);
            Alert.alert("Signup Failed", error.message);
        }
        
    };

    return(
        <LinearGradient 
            colors={['#FF0000', '#00FF00']}
            style={commonStyles.container}
        >
            {/* Back Button */}
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create your account</Text>
            
            <CustomPressable
                title={
                    <View style={styles.googleButtonContent}>
                        <Icon name="google" size={20} color="#8B3535" style={styles.googleIcon} /> {/* Google icon */}
                        <Text style={styles.googleText}>CONTINUE WITH GOOGLE</Text>
                    </View>
                }
                onPress={() => {}}
                style={[styles.socialButton, styles.googleButton]}
                textStyle={[styles.socialButtonText, styles.googleText]}
            />

            <Text style={styles.orText}>OR SIGN UP WITH EMAIL</Text>

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
                onPress={handleSignUp}
                style={styles.signupButton}
                textStyle={styles.signupButtonText}
            />
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
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIcon: {
        marginRight: 10, // Space between the icon and text
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
