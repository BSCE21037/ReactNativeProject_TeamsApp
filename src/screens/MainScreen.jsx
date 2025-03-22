import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, ScrollView, TextInput, SafeAreaView, TouchableOpacity, Dimensions, Animated, TouchableWithoutFeedback, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EmojiSelector from 'react-native-emoji-selector';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75; // 75% of screen width
const SCREEN_WIDTH = Dimensions.get('window').width;

const MainScreen = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState('general');
    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([
        {
            id: '1',
            sender: 'WelcomeBot',
            text: 'Hello team! How is everyone doing today?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollViewRef = useRef();

    const toggleDrawer = (open) => {
        Animated.timing(translateX, {
            toValue: open ? 0 : -DRAWER_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start();
        setIsDrawerOpen(open);
    };

    const handleJiraButtonPress = () => {
        if (messageText.trim()) {
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    id: Date.now().toString(),
                    sender: 'System',
                    text: `Task: "${messageText}" was added to Jira`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystemMessage: true
                }
            ]);
            setMessageText("");
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    };

    const handleSendMessage = () => {
        if (messageText.trim()) {
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    id: Date.now().toString(),
                    sender: 'Your Name',
                    text: messageText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystemMessage: false
                }
            ]);
            setMessageText('');
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    };

    const onEmojiSelected = (emoji) => {
        setMessageText(prevText => prevText + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[
                styles.sidebar,
                {
                    transform: [{ translateX }],
                    zIndex: 2,
                }
            ]}>
                <TouchableOpacity style={styles.workspaceHeader}>
                    <View style={styles.workspaceHeaderContent}>
                        <View style={styles.workspaceTitleContainer}>
                            <Image 
                                source={require('../Assets/flowjam_icon_cropped.png')} 
                                style={styles.workspaceIcon}
                            />
                            <Text style={styles.workspaceTitle}>FlowJam</Text>
                        </View>
                        <View style={styles.workspaceActions}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Icon name="notifications-outline" size={22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Icon name="create-outline" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={20} color="#A4A5D6" style={styles.searchIcon} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search conversations..."
                        placeholderTextColor="#A4A5D6"
                    />
                </View>

                {/* Channels and DMs */}
                <ScrollView style={styles.sidebarScroll}>
                    {/* Quick Actions */}
                    <TouchableOpacity style={styles.quickAction}>
                        <Icon name="chatbubbles-outline" size={20} color="#D1D2FF" style={styles.quickActionIcon} />
                        <Text style={styles.quickActionText}>All conversations</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <MaterialIcon name="message-processing-outline" size={20} color="#D1D2FF" style={styles.quickActionIcon} />
                        <Text style={styles.quickActionText}>Threads</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Icon name="bookmark-outline" size={20} color="#D1D2FF" style={styles.quickActionIcon} />
                        <Text style={styles.quickActionText}>Saved items</Text>
                    </TouchableOpacity>

                    {/* Channels Section */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Icon name="chevron-down" size={20} color="#A4A5D6" style={styles.sectionIcon} />
                            <Text style={styles.sectionTitle}>Channels</Text>
                        </View>
                        <TouchableOpacity>
                            <Icon name="add-circle-outline" size={20} color="#A4A5D6" />
                        </TouchableOpacity>
                    </View>

                    {/* Channel List */}
                    {[' general', ' random', ' announcements'].map((channel) => (
                        <TouchableOpacity 
                            key={channel}
                            style={[
                                styles.channelItem,
                                selectedChannel === channel && styles.selectedChannel
                            ]}
                            onPress={() => setSelectedChannel(channel)}
                        >
                            <MaterialIcon 
                                name="pound" 
                                size={20} 
                                color={selectedChannel === channel ? "#fff" : "#D1D2FF"} 
                                style={styles.channelIcon}
                            />
                            <Text style={[styles.channelText, selectedChannel === channel && styles.selectedChannelText]}>
                                {channel}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Direct Messages Section */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Icon name="chevron-down" size={20} color="#A4A5D6" style={styles.sectionIcon} />
                            <Text style={styles.sectionTitle}>Direct Messages</Text>
                        </View>
                        <TouchableOpacity>
                            <Icon name="add-circle-outline" size={20} color="#A4A5D6" />
                        </TouchableOpacity>
                    </View>

                    {/* DM List */}
                    <TouchableOpacity style={styles.dmItem}>
                        <View style={styles.dmAvatarContainer}>
                            <Icon name="person-circle" size={24} color="#D1D2FF" />
                            <View style={[styles.userStatus, { backgroundColor: '#4CAF50' }]} />
                        </View>
                        <Text style={styles.dmText}>Adolf Niggler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dmItem}>
                        <View style={styles.dmAvatarContainer}>
                            <Icon name="person-circle" size={24} color="#D1D2FF" />
                            <View style={[styles.userStatus, { backgroundColor: '#FFA000' }]} />
                        </View>
                        <Text style={styles.dmText}>Ben Dover</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* User Profile Section */}
                <TouchableOpacity style={styles.userProfile}>
                    <View style={styles.userProfileLeft}>
                        <Icon name="person-circle" size={32} color="#fff" />
                        <View style={[styles.userStatus, { backgroundColor: '#4CAF50' }]} />
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>Your Name</Text>
                            <Text style={styles.userPresence}>Active</Text>
                        </View>
                    </View>
                    <Icon name="settings-outline" size={20} color="#A4A5D6" />
                </TouchableOpacity>
            </Animated.View>

            {/* Backdrop */}
            {isDrawerOpen && (
                <TouchableWithoutFeedback onPress={() => toggleDrawer(false)}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>
            )}

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Channel Header */}
                <View style={styles.channelHeader}>
                    <View style={styles.channelHeaderLeft}>
                        <TouchableOpacity 
                            onPress={() => toggleDrawer(true)}
                            style={styles.menuButton}
                        >
                            <Icon name="menu" size={24} color="#1D1C1D" />
                        </TouchableOpacity>
                        <MaterialIcon name="pound" size={24} color="#1D1C1D" />
                        <Text style={styles.channelHeaderText}>{selectedChannel}</Text>
                    </View>
                    <View style={styles.channelHeaderRight}>
                        <Icon name="search-outline" size={22} color="#616061" style={styles.headerIcon} />
                        <Icon name="people-outline" size={22} color="#616061" style={styles.headerIcon} />
                        <Icon name="information-circle-outline" size={22} color="#616061" style={styles.headerIcon} />
                    </View>
                </View>

                {/* Messages Area */}
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((message) => (
                        <View 
                            key={message.id} 
                            style={[
                                styles.messageItem,
                                message.isSystemMessage && styles.systemMessageItem
                            ]}
                        >
                            {!message.isSystemMessage && (
                                <Icon name="person-circle" size={36} color="#E2E2E2" />
                            )}
                            <View style={[
                                styles.messageContent,
                                message.isSystemMessage && styles.systemMessageContent
                            ]}>
                                <View style={styles.messageHeader}>
                                    <Text style={[
                                        styles.messageSender,
                                        message.isSystemMessage && styles.systemMessageSender
                                    ]}>
                                        {message.sender}
                                    </Text>
                                    <Text style={styles.messageTime}>{message.time}</Text>
                                </View>
                                <Text style={[
                                    styles.messageText,
                                    message.isSystemMessage && styles.systemMessageText
                                ]}>
                                    {message.text}
                                </Text>
                                {!message.isSystemMessage && (
                                    <View style={styles.messageActions}>
                                        <TouchableOpacity style={styles.reactionButton}>
                                            <MaterialIcon name="emoticon-outline" size={16} color="#616061" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.reactionButton}>
                                            <MaterialIcon name="message-outline" size={16} color="#616061" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.reactionButton, { marginRight: 0 }]}>
                                            <MaterialIcon name="share-outline" size={16} color="#616061" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Message Input */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.input, { color: '#000000' }]}
                                placeholder="Message #general"
                                placeholderTextColor="#999999"
                                value={messageText}
                                onChangeText={setMessageText}
                                onSubmitEditing={handleSendMessage}
                            />
                            <TouchableOpacity 
                                style={styles.jiraButton}
                                onPress={handleJiraButtonPress}
                            >
                                <MaterialIcon name="jira" size={22} color="#2684FF" />
                                <Text style={styles.jiraButtonText}>Jira</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.sendButton}
                                onPress={handleSendMessage}
                            >
                                <MaterialIcon name="send" size={24} color="#8B3535" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputActions}>
                            <TouchableOpacity style={styles.inputButton}>
                                <Icon name="attach" size={22} color="#616061" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.inputButton}
                                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Icon name="happy-outline" size={22} color="#616061" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.inputButton}>
                                <MaterialIcon name="format-bold" size={22} color="#616061" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <View style={styles.emojiPickerContainer}>
                            <EmojiSelector
                                onEmojiSelected={onEmojiSelected}
                                columns={8}
                                showSearchBar={false}
                                showHistory={true}
                                showSectionTitles={true}
                                category={[
                                    'smileys_people',
                                    'animals_nature',
                                    'food_drink',
                                    'activities',
                                    'travel_places',
                                    'objects',
                                    'symbols',
                                    'flags'
                                ]}
                                style={styles.emojiPicker}
                            />
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    sidebar: {
        width: DRAWER_WIDTH,
        backgroundColor: '#2E5339', // Forest green base color
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
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
    workspaceHeader: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#8B3535', // Deep red accent
    },
    workspaceHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    workspaceTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    workspaceTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    workspaceActions: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 4,
        marginLeft: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        padding: 8,
        backgroundColor: '#3D6B4A',
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
    },
    searchIcon: {
        marginRight: 8,
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
    },
    quickActionIcon: {
        marginRight: 12,
    },
    quickActionText: {
        color: '#D1D2FF',
        fontSize: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        marginRight: 8,
    },
    sectionTitle: {
        color: '#A4A5D6',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    channelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 16,
    },
    selectedChannel: {
        backgroundColor: '#8B3535',
    },
    channelText: {
        color: '#D1D2FF',
        fontSize: 15,
    },
    selectedChannelText: {
        color: '#fff',
        fontWeight: '500',
    },
    dmItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 16,
    },
    dmAvatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    userStatus: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#3F4079',
        position: 'absolute',
        bottom: 0,
        right: -2,
    },
    dmText: {
        color: '#D1D2FF',
        fontSize: 15,
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#8B3535',
    },
    userProfileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfo: {
        marginLeft: 12,
    },
    userName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    userPresence: {
        color: '#A4A5D6',
        fontSize: 12,
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#fff',
    },
    channelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E2E2',
    },
    channelHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    channelHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    channelHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginLeft: 16,
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
    },
    messageItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    messageAvatar: {
        width: 36,
        height: 36,
        borderRadius: 4,
        backgroundColor: '#E2E2E2',
        marginRight: 12,
    },
    messageContent: {
        flex: 1,
    },
    messageSender: {
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1D1C1D',
    },
    messageText: {
        color: '#1D1C1D',
        lineHeight: 20,
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E2E2',
    },
    inputWrapper: {
        flexDirection: 'column',
        backgroundColor: '#F8F8F8',
        borderWidth: 1,
        borderColor: '#E2E2E2',
        borderRadius: 4,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        padding: 12,
        fontSize: 15,
        color: '#000000',
    },
    inputActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
    },
    inputButton: {
        padding: 8,
    },
    menuButton: {
        padding: 8,
        marginRight: 8,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageTime: {
        fontSize: 12,
        color: '#616061',
        marginLeft: 8,
    },
    messageActions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    reactionButton: {
        padding: 4,
        marginRight: 16,
    },
    workspaceIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 8,
    },
    jiraButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DEEBFF',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    jiraButtonText: {
        color: '#2684FF',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    sendButton: {
        padding: 8,
        marginRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    systemMessageItem: {
        justifyContent: 'center',
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    systemMessageContent: {
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        alignSelf: 'center',
        maxWidth: '90%',
    },
    systemMessageText: {
        color: '#2E7D32',
        fontWeight: '500',
        textAlign: 'center',
    },
    systemMessageSender: {
        display: 'none',
    },
    emojiPickerContainer: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    emojiPicker: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default MainScreen;