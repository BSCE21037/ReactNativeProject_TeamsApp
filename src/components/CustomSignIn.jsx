import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

const CustomTextInput = ({
    value,
    onChangeText,
    placeholder,
    style,
    inputStyle,
    secureTextEntry,
    placeholderTextColor
}) => {
    return(
        <View style={[styles.container, style]}>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                style={[styles.input, inputStyle]}
                secureTextEntry={secureTextEntry}
                placeholderTextColor={placeholderTextColor}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        fontSize: 16,
        height: 40,
    },
    container: {
        borderWidth: 2,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    }
});

export default CustomTextInput;