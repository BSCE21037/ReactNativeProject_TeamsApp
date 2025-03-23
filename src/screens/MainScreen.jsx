import React, { useState, useRef } from "react";
import { StyleSheet, View, SafeAreaView, Dimensions, Animated, TouchableWithoutFeedback } from "react-native";
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

const MainScreen = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState('general');
    const [selectedDM, setSelectedDM] = useState(null);
    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const [messages, setMessages] = useState([
        {
            id: '1',
            sender: 'Adolf Niggler',
            text: 'Hello team! How is everyone doing today?',
            time: '12:30 PM',
            reactions: {}
        }
    ]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [channelMessages, setChannelMessages] = useState({
        general: [],
        announcements: [],
        random: [],
        // ... other channels ...
    });
    const [dmMessages, setDmMessages] = useState({
        // Messages stored by contact ID
        '1': [], // John Doe's messages
        '2': [], // Jane Smith's messages
        '3': [], // Mike Johnson's messages
    });

    const toggleDrawer = (open) => {
        Animated.timing(translateX, {
            toValue: open ? 0 : -DRAWER_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start();
        setIsDrawerOpen(open);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Sidebar 
                translateX={translateX} 
                toggleDrawer={toggleDrawer}
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                selectedDM={selectedDM}
                setSelectedDM={setSelectedDM}
                drawerWidth={DRAWER_WIDTH}
            />

            {/* Backdrop */}
            {isDrawerOpen && (
                <TouchableWithoutFeedback onPress={() => toggleDrawer(false)}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>
            )}

            <ChatArea 
                channelMessages={channelMessages}
                setChannelMessages={setChannelMessages}
                dmMessages={dmMessages}
                setDmMessages={setDmMessages}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                showReactionPicker={showReactionPicker}
                setShowReactionPicker={setShowReactionPicker}
                selectedMessageId={selectedMessageId}
                setSelectedMessageId={setSelectedMessageId}
                toggleDrawer={toggleDrawer}
                selectedChannel={selectedChannel}
                selectedDM={selectedDM}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
});

export default MainScreen;
