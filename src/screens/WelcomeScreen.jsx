import React from "react";
import { StyleSheet, View, Image, Text, ImageBackground } from "react-native";
import CustomWelcome from "../components/CustomWelcome";

const WelcomeScreen = ({ navigation }) => {
    return(
        <ImageBackground 
            source={require("../Assets/welcome.png")} 
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                {/* Logo at the top */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>FlowJam</Text>
                   
                    
                </View>

                
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeTitle}>Hi New User, Welcome</Text>
                    <Text style={styles.welcomeSubtitle}>to FlowJam</Text>
                    <Text style={styles.description}>
                    Where Workflows and {'\n'}
                    Conversations Jam Together.
                    </Text>
                </View>

                
                <CustomWelcome
                    title="GET STARTED"
                    onPress={() => navigation.navigate('SignIn')}
                    style={styles.customButton}
                    textStyle={styles.customText}
                />
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 60,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        color: 'white',
        fontSize: 24,
        fontWeight: '500',
    },
    moonIcon: {
        width: 30,
        height: 30,
        marginHorizontal: 8,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    welcomeTitle: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    welcomeSubtitle: {
        fontSize: 28,
        color: 'white',
        fontWeight: '300',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
    },
    customButton: {
        backgroundColor: "#3F4079",
        borderRadius: 25,
        paddingHorizontal: 45,
        paddingVertical: 18,
        width: '85%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
    customText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: '700',
        letterSpacing: 1.5,
    },
});

export default WelcomeScreen;