import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Image, Animated } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import CustomWelcome from "../components/CustomWelcome";
import flowjamIcon from '../Assets/flowjam_icon_cropped.png';

const WelcomeScreen = ({ navigation }) => {
    const titleAnim = useRef(new Animated.Value(0)).current; // Initial opacity for title
    const subtitleAnim = useRef(new Animated.Value(0)).current; // Initial opacity for subtitle
    const descriptionAnim = useRef(new Animated.Value(0)).current; // Initial opacity for description
    const bounceAnim = useRef(new Animated.Value(1)).current; // Initial scale for bouncing effect

    useEffect(() => {
        Animated.timing(titleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        Animated.timing(subtitleAnim, {
            toValue: 1,
            duration: 1000,
            delay: 300, // Delay for subtitle
            useNativeDriver: true,
        }).start();

        Animated.timing(descriptionAnim, {
            toValue: 1,
            duration: 1000,
            delay: 600, // Delay for description
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: 1.2,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [titleAnim, subtitleAnim, descriptionAnim, bounceAnim]);

    return (
        <LinearGradient 
            colors={['#FF0000', '#00FF00']}
            style={styles.container}
        >
            <View style={styles.logoContainer}>
                <Image 
                    source={flowjamIcon} 
                    style={styles.logoIcon}
                />
                <Text style={styles.logoText}>FlowJam</Text>
            </View>

            <View style={styles.welcomeContainer}>
                <Animated.View style={{ opacity: titleAnim }}>
                    <Text style={styles.welcomeTitle}>Hi New User, Welcome</Text>
                </Animated.View>
                <Animated.View style={{ opacity: subtitleAnim }}>
                    <Text style={styles.welcomeSubtitle}>to FlowJam</Text>
                </Animated.View>
                <Animated.View style={{ opacity: descriptionAnim }}>
                    <Text style={styles.description}>
                        Where Workflows and {'\n'}
                        Conversations Jam Together.
                    </Text>
                </Animated.View>
            </View>

            {/* Animated Circles */}
            <Animated.View style={[styles.animatedCircle, { transform: [{ scale: bounceAnim }] }]} />
            <Animated.View style={[styles.animatedCircle, { transform: [{ scale: bounceAnim }], top: '60%' }]} />
            <Animated.View style={[styles.animatedCircle, { transform: [{ scale: bounceAnim }], top: '70%' }]} />

            <CustomWelcome
                title="GET STARTED"
                onPress={() => navigation.navigate('SignIn')}
                style={styles.customButton}
                textStyle={styles.customText}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
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
    logoIcon: {
        width: 30,
        height: 30,
        marginRight: 8,
    },
    logoText: {
        color: 'white',
        fontSize: 24,
        fontWeight: '500',
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
    animatedCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
        position: 'absolute',
        top: '50%', // Center vertically for the first circle
        left: '50%', // Center horizontally
        marginLeft: -50, // Half of width
        marginTop: -50, // Half of height
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