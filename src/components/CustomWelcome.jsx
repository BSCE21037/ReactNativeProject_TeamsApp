import React from "react";
import { StyleSheet,Text,View,Pressable } from "react-native";

const CustomScreen = ({title,onPress,style,textStyle}) => {
    return(
        <Pressable onPress={onPress} style={({pressed}) =>[
            styles.button,
            pressed && styles.pressedButton,
            style,

        ]}>
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pressedButton: {
        backgroundColor:"#0056b3",
        borderColor:"003d80",
    },
    text:{
        color:"white",
        fontSize:16,
        fontWeight:'bold',
    },
    button:{
        backgroundColor:"#007BFF",
        paddingVertical:12,
        paddingHorizontal:20,
        borderRadius:8,
        alignItems:'center',
        justifyContent:'center',
        borderWidth:2,
        borderColor:"#007BFF"
    },



});

export default CustomScreen;

