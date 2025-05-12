import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Alert, Image, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EmojiSelector from 'react-native-emoji-selector';
import DocumentPicker from '@react-native-documents/picker';
import * as ImagePicker from 'react-native-image-picker';
import jira from '../services/jiraService';
import { auth, db } from '../../firebaseConfig';
// import { createIssue, searchIssues, getAuthToken } from '../services/jiraService';
// import authenticateWithJira from '../services/jiraService';
import * as jiraAPI from '../services/jiraAPI';
import {
    doc,
    getDoc,
    collection,
    addDoc,
    onSnapshot,
    orderBy,
    serverTimestamp,
    runTransaction,
    query
} from 'firebase/firestore';
import { authenticateWithJira, getAuthToken, createIssue } from '../services/jiraService';

//***************************************************************************************** */
//! Very dangerous script
//**************************************************************************************** */
const ChatArea = ({
    navigation,
    channelMessages,
    setChannelMessages,
    dmMessages,
    setDmMessages,
    showEmojiPicker,
    setShowEmojiPicker,
    toggleDrawer,
    selectedChannel,
    selectedDM,
}) => {
    const [messageText, setMessageText] = useState("");
    const scrollViewRef = useRef();
    const [showFilePicker, setShowFilePicker] = useState(false);
    const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');

    const QUICK_REACTIONS = ['👍', '❤️', '😊', '😂', '🎉', '👏'];
    // Replace your existing message state and handlers with:

    const [messages, setMessages] = useState([]);

    // Load messages on mount
    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, "users", user.email);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setName(userDocSnap.data().name);
                }
            }
        };

        fetchUserData();


        // const userDocRef = doc(db, "users", user.email);
        // const userDocSnap = await getDoc(userDocRef);

        // const userName = userDocSnap.data().name;
        // console.log("Fetched name:", userName);

        if (!selectedChannel && !selectedDM?.id) {
            Alert.alert("Error", "No channel or DM selected");
            return;
        }

        const messagesRef = collection(db, 'chats', selectedChannel || selectedDM?.id, 'messages');
        const unsubscribe = onSnapshot(
            query(messagesRef, orderBy('createdAt', 'asc')),
            (snapshot) => {
                const loadedMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(loadedMessages);
            },
            (error) => {
                if (error.code === 'permission-denied') {
                    Alert.alert("Permission Error", "Please login to view messages");
                } else {
                    Alert.alert("Error", "Failed to load messages");
                }
            }
        );

        return () => unsubscribe();
    }, [selectedChannel, selectedDM?.id]);


    // // Helper function to get current messages

    // Helper function to update messages
    const updateMessages = (newMessage) => {
        if (selectedChannel) {
            setChannelMessages(prev => ({
                ...prev,
                [selectedChannel]: [...(prev[selectedChannel] || []), newMessage]
            }));
        } else if (selectedDM) {
            setDmMessages(prev => ({
                ...prev,
                [selectedDM.id]: [...(prev[selectedDM.id] || []), newMessage]
            }));
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            Alert.alert("Error", "Message cannot be empty");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "You must be logged in to send messages");
            return;
        }

        try {
            const messagesRef = collection(db, 'chats', selectedChannel || selectedDM?.id, 'messages');
            setMessageText('');
            await addDoc(messagesRef, {
                text: messageText,
                sender: name,
                userId: user.uid,
                createdAt: serverTimestamp(),
                isSystemMessage: false
            });
        } catch (error) {
            console.error("Error sending message:", error);
            Alert.alert("Error", error.message || "Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    // Update the placeholder text based on current selection
    const getPlaceholderText = () => {
        if (selectedChannel) {
            return `Message #${selectedChannel.toLowerCase()}`;
        } else if (selectedDM) {
            return `Message ${selectedDM.name}`;
        }
        return 'Message';
    };

    const fetchTasks = async () => {
        try {
            const token = await getAuthToken(); // From secure storage
            const result = await searchIssues(
                'assignee = currentUser() AND status IN ("To Do", "In Progress")',
                token
            );
            setTasks(result.issues);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };


    const handleJiraButtonPress = async () => {
        if (!messageText.trim()) {
            Alert.alert('Error', 'Please enter issue summary');
            return;
        }

        setIsLoading(true);

        try {
            // Create the issue
            const response = await createIssue({
                summary: messageText,
                description: "Created from mobile app", // optional
                projectKey: 'SCRUM' // or get from user input
            });

            Alert.alert(
                'Success',
                `Jira issue created: ${response.key}\n${response.self}`
            );

            // Add a system message to the chat
            const user = auth.currentUser;
            const chatRef = collection(
                db,
                'chats',
                selectedChannel || selectedDM?.id,
                'messages'
            );

            await addDoc(chatRef, {
                text: `Created Jira issue: ${response.key} - ${messageText}`,
                sender: 'System',
                userId: 'system',
                createdAt: serverTimestamp(),
                isSystemMessage: true,
                jiraIssue: {
                    key: response.key,
                    url: `https://teamsapp.atlassian.net/browse/${response.key}`
                }
            });

            setMessageText('');
        } catch (error) {
            console.error('Jira operation failed:', error);
            let errorMessage = error.message || 'Failed to create issue';

            if (error.message.includes('401')) {
                errorMessage = 'Jira authentication failed. Please check your API token in settings.';
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };



    // const handleReaction = (messageId, emoji) => {
    //     if (!messageId || !emoji) return;

    //     setChannelMessages(prevMessages => ({
    //         ...prevMessages,
    //         [selectedChannel]: (prevMessages[selectedChannel] || []).map(message => {
    //             if (message.id === messageId) {
    //                 const reactions = { ...(message.reactions || {}) };

    //                 if (!reactions[emoji]) {
    //                     reactions[emoji] = ['currentUser'];
    //                 } else {
    //                     const userIndex = reactions[emoji].indexOf('currentUser');
    //                     if (userIndex > -1) {
    //                         reactions[emoji] = reactions[emoji].filter(id => id !== 'currentUser');
    //                         if (reactions[emoji].length === 0) {
    //                             delete reactions[emoji];
    //                         }
    //                     } else {
    //                         reactions[emoji] = [...reactions[emoji], 'currentUser'];
    //                     }
    //                 }

    //                 return {
    //                     ...message,
    //                     reactions
    //                 };
    //             }
    //             return message;
    //         })
    //     }));

    //     setReactionPickerVisible(false);
    //     setActiveMessageId(null);
    // };
    const handleReaction = async (messageId, emoji) => {
        const messageRef = doc(db, 'chats', selectedChannel || selectedDM?.id, 'messages', messageId);

        await runTransaction(db, async (transaction) => {
            const messageDoc = await transaction.get(messageRef);
            if (!messageDoc.exists()) {
                throw new Error("Message does not exist!");
            }

            const reactions = messageDoc.data().reactions || {};
            if (!reactions[emoji]) {
                reactions[emoji] = [auth.currentUser.uid];
            } else {
                const userIndex = reactions[emoji].indexOf(auth.currentUser.uid);
                if (userIndex > -1) {
                    reactions[emoji] = reactions[emoji].filter(id => id !== auth.currentUser.uid);
                    if (reactions[emoji].length === 0) {
                        delete reactions[emoji];
                    }
                } else {
                    reactions[emoji] = [...reactions[emoji], auth.currentUser.uid];
                }
            }

            transaction.update(messageRef, { reactions });
        });
    };

    const openReactionPicker = (messageId) => {
        setActiveMessageId(messageId);
        setReactionPickerVisible(true);
    };

    const onEmojiSelected = (emoji) => {
        setMessageText(prevText => prevText + emoji);
        setShowEmojiPicker(false);
    };

    const handleDocumentPick = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                allowMultiSelection: false,
            });

            const file = result[0];
            Alert.alert('File Selected', `Name: ${file.name}\nSize: ${file.size} bytes`);

            const newMessage = {
                id: Date.now().toString(),
                sender: 'Your Name',
                text: `📎 File: ${file.name}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystemMessage: false,
                isFile: true,
                fileType: file.type,
                fileName: file.name,
                fileSize: file.size,
                reactions: {}
            };
            updateMessages(newMessage);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                Alert.alert('Error', 'Error picking the file');
            }
        }
        setShowFilePicker(false);
    };

    const handleImagePick = () => {
        const options = {
            mediaType: 'mixed',
            quality: 1,
            includeBase64: false,
        };

        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                // User cancelled image picker
            } else if (response.error) {
                Alert.alert('Error', 'Error picking the image');
            } else {
                const asset = response.assets[0];

                const newMessage = {
                    id: Date.now().toString(),
                    sender: 'Your Name',
                    text: `📷 Image: ${asset.fileName}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystemMessage: false,
                    isImage: true,
                    imageUri: asset.uri,
                    reactions: {}
                };
                updateMessages(newMessage);
            }
        });
        setShowFilePicker(false);
    };

    return (
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
                    <Text style={styles.channelHeaderText}>{selectedChannel || selectedDM?.name}</Text>
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
                                <Text style={styles.messageTime}>
                                    {message.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <Text style={[
                                styles.messageText,
                                message.isSystemMessage && styles.systemMessageText
                            ]}>
                                {message.text}
                            </Text>
                            {message.jiraIssue && (
                                <TouchableOpacity
                                    onPress={() => Linking.openURL(message.jiraIssue.url)}
                                    style={styles.jiraIssueLink}
                                >
                                    <Text style={styles.jiraIssueText}>
                                        <MaterialIcon name="jira" size={22} color="#2684FF" />
                                        Jira: {message.jiraIssue.key}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {/* Keep all your existing message UI features */}
                            {!message.isSystemMessage && (
                                <>
                                    <View style={styles.messageActions}>
                                        <TouchableOpacity
                                            style={styles.reactionButton}
                                            onPress={() => openReactionPicker(message.id)}
                                        >
                                            <MaterialIcon name="emoticon-outline" size={16} color="#616061" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.reactionButton}>
                                            <MaterialIcon name="message-outline" size={16} color="#616061" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.reactionButton, { marginRight: 0 }]}>
                                            <MaterialIcon name="share-outline" size={16} color="#616061" />
                                        </TouchableOpacity>
                                    </View>
                                    {Object.keys(message.reactions || {}).length > 0 && (
                                        <View style={styles.reactionsContainer}>
                                            {Object.entries(message.reactions).map(([emoji, users]) => (
                                                <TouchableOpacity
                                                    key={emoji}
                                                    style={[
                                                        styles.reactionBadge,
                                                        users.includes('currentUser') && styles.reactionBadgeSelected
                                                    ]}
                                                    onPress={() => handleReaction(message.id, emoji)}
                                                >
                                                    <Text>{emoji}</Text>
                                                    <Text style={styles.reactionCount}>{users.length}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}

                            {message.isFile && (
                                <View style={styles.fileMessage}>
                                    <MaterialIcon
                                        name="file-document-outline"
                                        size={24}
                                        color="#616061"
                                        style={styles.fileIcon}
                                    />
                                    <Text style={styles.fileName}>{message.fileName}</Text>
                                    <Text style={styles.fileSize}>
                                        {(message.fileSize / 1024).toFixed(1)} KB
                                    </Text>
                                </View>
                            )}
                            {message.isImage && (
                                <Image
                                    source={{ uri: message.imageUri }}
                                    style={{ width: 200, height: 200, borderRadius: 8, marginTop: 4 }}
                                    resizeMode="cover"
                                />
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
                            placeholder={getPlaceholderText()}
                            placeholderTextColor="#999999"
                            value={messageText}
                            onChangeText={setMessageText}
                            onSubmitEditing={handleSendMessage}
                        />
                        <TouchableOpacity
                            style={styles.jiraButton}
                            onPress={handleJiraButtonPress}
                            disabled={isLoading}
                        >
                            <MaterialIcon name="jira" size={22} color="#2684FF" />
                            <Text style={styles.jiraButtonText}>
                                {isLoading ? 'Working with Jira...' : 'Jira'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.standupButton}
                            onPress={() => navigation.navigate('StandUpBot')}
                        >
                            <Text style={styles.jiraButtonText}>Daily Stand-Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSendMessage}
                        >
                            <MaterialIcon name="send" size={24} color="#8B3535" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputActions}>
                        <TouchableOpacity
                            style={styles.inputButton}
                            onPress={() => setShowFilePicker(true)}
                        >
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
                        {/* <TouchableOpacity 
                            onPress={authenticateWithJira}
                            style={styles.authButton}
                            >
                            <Text>Login to Jira</Text>
                            </TouchableOpacity> */}
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

            {/* Reaction Picker */}
            {reactionPickerVisible && (
                <Modal
                    visible={reactionPickerVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => {
                        setReactionPickerVisible(false);
                        setActiveMessageId(null);
                    }}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            setReactionPickerVisible(false);
                            setActiveMessageId(null);
                        }}
                    >
                        <View style={styles.quickReactionsContainer}>
                            {QUICK_REACTIONS.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={styles.quickReactionButton}
                                    onPress={() => {
                                        if (activeMessageId) {
                                            handleReaction(activeMessageId, emoji);
                                        }
                                    }}
                                >
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {/* File Picker Modal */}
            <Modal
                visible={showFilePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowFilePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilePicker(false)}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleDocumentPick}
                        >
                            <MaterialIcon name="file-document-outline" size={24} color="#616061" />
                            <Text style={styles.modalOptionText}>Document</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleImagePick}
                        >
                            <MaterialIcon name="image-outline" size={24} color="#616061" />
                            <Text style={styles.modalOptionText}>Photo & Video</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    channelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    channelHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    channelHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
        color: '#212529',
    },
    channelHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginLeft: 20,
        color: '#6C757D',
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
        backgroundColor: '#F8F9FA',
    },
    messageItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    messageContent: {
        flex: 1,
        marginLeft: 10,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    messageSender: {
        fontWeight: '600',
        color: '#212529',
        fontSize: 15,
    },
    messageText: {
        color: '#495057',
        lineHeight: 22,
        fontSize: 15,
    },
    messageTime: {
        fontSize: 12,
        color: '#6C757D',
        marginLeft: 8,
    },
    messageActions: {
        flexDirection: 'row',
        marginTop: 6,
    },
    reactionButton: {
        padding: 6,
        marginRight: 12,
        borderRadius: 4,
    },
    inputContainer: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
    },
    inputWrapper: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DEE2E6',
        borderRadius: 24,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#212529',
        maxHeight: 120,
        paddingHorizontal: 8,
    },
    inputActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
    },
    inputButton: {
        padding: 8,
        borderRadius: 20,
    },
    menuButton: {
        padding: 6,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#E9ECEF',
    },
    jiraButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E7F1FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginLeft: 8,
    },
    jiraButtonText: {
        color: '#0D6EFD',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    sendButton: {
        padding: 10,
        marginLeft: 8,
        backgroundColor: '#0D6EFD',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    systemMessageItem: {
        justifyContent: 'center',
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    systemMessageContent: {
        backgroundColor: '#E6F9ED',
        padding: 12,
        borderRadius: 12,
        alignSelf: 'center',
        maxWidth: '90%',
    },
    systemMessageText: {
        color: '#0F5132',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 14,
    },
    emojiPickerContainer: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        height: 340,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    emojiPicker: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginHorizontal: -4,
    },
    reactionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        margin: 4,
    },
    reactionBadgeSelected: {
        backgroundColor: '#E7F1FF',
        borderColor: '#0D6EFD',
    },
    reactionCount: {
        marginLeft: 6,
        fontSize: 12,
        color: '#495057',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        paddingBottom: 32,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        marginBottom: 12,
    },
    modalOptionText: {
        marginLeft: 16,
        fontSize: 16,
        color: '#212529',
        fontWeight: '500',
    },
    fileMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    fileIcon: {
        marginRight: 12,
        color: '#495057',
    },
    fileName: {
        flex: 1,
        color: '#212529',
        fontSize: 14,
        fontWeight: '500',
    },
    fileSize: {
        color: '#6C757D',
        fontSize: 12,
        marginLeft: 8,
    },
    quickReactionsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 12,
        marginBottom: 20,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    quickReactionButton: {
        padding: 10,
        marginHorizontal: 6,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
    },
    emojiText: {
        fontSize: 24,
    },
    standupButton: {
        backgroundColor: '#0D6EFD',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        marginLeft: 8,
    },
    jiraIssueLink: {
        marginTop: 8,
        padding: 10,
        backgroundColor: '#E7F1FF',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    jiraIssueText: {
        color: '#0D6EFD',
        fontWeight: '500',
        marginLeft: 6,
    },
    // New styles for message bubbles
    messageBubble: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    systemBubble: {
        backgroundColor: '#E6F9ED',
        borderColor: '#C3E6CB',
    },
    // Avatar styles
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E9ECEF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#6C757D',
        fontWeight: 'bold',
    },
});
export default ChatArea;