import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import CustomTextInput from "../components/CustomSignIn";
import CustomPressable from "../components/CustomWelcome";
import { commonStyles } from '../styles';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, WEB_CLIENT_ID, db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../../firebaseConfig";

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        GoogleSignin.configure({
          webClientId: WEB_CLIENT_ID,
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });
      }, []);


      const handlePress = async () => {
        if (!email || !password) {
            Alert.alert('Error','Please fill in all fields.');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User Signed In: ', userCredential);
            Alert.alert("Success", "User Signed In Successfully");
            navigation.navigate("Main");
          } catch (error) {
            console.log(error.message);
            
            // More user-friendly error messages
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
    }

        // Google Sign-In
    // const handleGoogleSignIn = async () => {
    //     try {
    //     await GoogleSignin.hasPlayServices();
        
    //     const { data } = await GoogleSignin.signIn();

    //     if (!data.idToken) {
    //         throw new Error('No ID token found');
    //     }
    //     const googleCredential = GoogleAuthProvider.credential(data.idToken);
    //     const userCredential = await signInWithCredential(auth, googleCredential);
    //     const user = userCredential.user;
        
    //     console.log("Google Sign-In Successful!");

    //     // Check if user already exists in Firestore
    //     const userRef = doc(db, "users", user.uid);
    //     const userSnap = await getDoc(userRef);

    //     if (!userSnap.exists()) {
    //         // Add a new document to Firestore with user data
    //         await setDoc(userRef, {
    //         uid: user.uid,
    //         name: user.displayName || user.name,
    //         email: user.email || user.email,
    //         address: "",
    //         photoURL: user.photoURL || "",
    //         createdAt: new Date(),
    //         favorites: [],
    //         });
    //         console.log("User added to Firestore!");
    //         Alert.alert("Success", "User account created!");
    //     } else {
    //         console.log("User already exists in Firestore");
    //     }

    //     // Save user data in AsyncStorage
    //     await AsyncStorage.setItem("user", JSON.stringify(user));
    //     console.log("User saved to AsyncStorage!");

    //     navigation.navigate("Main");
    //     } catch (error) {
    //     console.log('Google Sign-In Error:', error);
    //     }
    // };


    return(
        <LinearGradient 
            colors={['#FF0000', '#00FF00']} // Red to Green gradient
            style={commonStyles.container}
        >
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
                title={
                    <View style={styles.googleButtonContent}>
                        <Icon name="google" size={20} color="#8B3535" style={styles.googleIcon} />
                        <Text style={styles.googleText}>CONTINUE WITH GOOGLE</Text>
                    </View>
                }
                // onPress={handleGoogleSignIn}
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
                // onPress={() => navigation.navigate('Main')}
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
});

export default SignInScreen;