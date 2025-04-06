import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EmojiSelector from 'react-native-emoji-selector';
import DocumentPicker from '@react-native-documents/picker';
import * as ImagePicker from 'react-native-image-picker';
import jira from '../services/jiraService';
import firestore from '@react-native-firebase/firestore';
import { auth, db } from '../../firebaseConfig';
// import { createIssue, searchIssues, getAuthToken } from '../services/jiraService';
import Keychain from 'react-native-keychain';
// import authenticateWithJira from '../services/jiraService';
import * as jiraAPI from '../services/jiraAPI';
import { authenticateWithJira, getAuthToken } from '../services/jiraService';
//***************************************************************************************** */

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

    const QUICK_REACTIONS = ['👍', '❤️', '😊', '😂', '🎉', '👏'];
    // Replace your existing message state and handlers with:

    const [messages, setMessages] = useState([]);

    // Load messages on mount
    useEffect(() => {
        if (!selectedChannel && !selectedDM?.id){
            Alert.alert("Error", "No channel or DM selected");
            return;
        }
      
        const unsubscribe = firestore()
          .collection('chats')
          .doc(selectedChannel || selectedDM?.id)
          .collection('messages')
          .orderBy('createdAt', 'asc')
          .onSnapshot(
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
          console.log("Attempting to send message...");
            console.log("Selected channel/DM:", selectedChannel || selectedDM?.id);
      
        return () => unsubscribe();
        
      }, [selectedChannel, selectedDM?.id]);


    // // Helper function to get current messages
    // const getCurrentMessages = () => {
    //     if (selectedChannel) {
    //         return channelMessages[selectedChannel] || [];
    //     } else if (selectedDM) {
    //         return dmMessages[selectedDM.id] || [];
    //     }
    //     return [];
    // };

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
        console.log("Sending message:", messageText);
        console.log("Selected channel/DM:", selectedChannel || selectedDM?.id);
        if (!messageText.trim()) {
          Alert.alert("Error", "Message cannot be empty");
          return;
        }
        
        const user = auth.currentUser;
        console.log("Current user:", user);
        if (!user) {
          Alert.alert("Error", "You must be logged in to send messages");
          return;
        }
      
        try {
          setIsLoading(true);
          
          const chatRef = firestore()
            .collection('chats') // Removed incorrect db parameter
            .doc(selectedChannel || selectedDM?.id)
            .collection('messages');
      
          await chatRef.add({
            text: messageText,
            sender: user.displayName || user.email,
            userId: user.uid,
            createdAt: firestore.FieldValue.serverTimestamp(),
            isSystemMessage: false
          });
      
          setMessageText('');
        //   Alert.alert("Success", "Message sent successfully");
        } catch (error) {
          console.error("Error sending message:", error);
          Alert.alert("Error", error.message || "Failed to send message");
        } finally {
          setIsLoading(false);
          // Removed duplicate success alert here
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
          // Try to get existing token first
          let token = await getAuthToken();
          console.log('Fetched token:', token);
          
          // If no token, authenticate first
          if (!token) {
            console.log('No token found, authenticating...');
            token = await authenticateWithJira();
          }
      
          const issueData = {
            fields: {
              summary: messageText,
              issuetype: { name: 'Task' },
              project: { key: 'SCRUM' }
            }
          };
      
          const response = await jiraAPI.createIssue(issueData, token);
          
          Alert.alert('Success', `Created issue: ${response.key || response.id}`);
          setMessageText('');
          
        } catch (error) {
          console.error('Jira operation failed:', error);
          Alert.alert(
            'Error',
            error.message.includes('401') 
              ? 'Session expired. Please login again.' 
              : error.message || 'Failed to create issue'
          );
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
        const messageRef = firestore()
          .collection('chats')
          .doc(selectedChannel || selectedDM?.id)
          .collection('messages')
          .doc(messageId);
      
        // Update reactions in Firestore
        await firestore().runTransaction(async (transaction) => {
          const doc = await transaction.get(messageRef);
          const reactions = doc.data().reactions || {};
          if (!reactions[emoji]) {
            reactions[emoji] = [auth().currentUser.uid];
          } else {
            const userIndex = reactions[emoji].indexOf('currentUser');
                        if (userIndex > -1) {
                            reactions[emoji] = reactions[emoji].filter(id => id !== 'currentUser');
                            if (reactions[emoji].length === 0) {
                                delete reactions[emoji];
                            }
                        } else {
                            reactions[emoji] = [...reactions[emoji], 'currentUser'];
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
                            
                            {/* File and image attachments */}
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
                        <TouchableOpacity 
                            onPress={authenticateWithJira}
                            style={styles.authButton}
                            >
                            <Text>Login to Jira</Text>
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
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginHorizontal: -4,
    },
    reactionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        margin: 4,
    },
    reactionBadgeSelected: {
        backgroundColor: '#E8F5E9',
        borderColor: '#2E7D32',
    },
    reactionCount: {
        marginLeft: 4,
        fontSize: 12,
        color: '#616061',
    },
    reactionPickerContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 250,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        paddingBottom: 32,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
    },
    modalOptionText: {
        marginLeft: 16,
        fontSize: 16,
        color: '#1D1C1D',
    },
    fileMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        padding: 8,
        borderRadius: 4,
        marginTop: 4,
    },
    fileIcon: {
        marginRight: 8,
    },
    fileName: {
        flex: 1,
        color: '#1D1C1D',
    },
    fileSize: {
        color: '#616061',
        fontSize: 12,
        marginLeft: 8,
    },
    quickReactionsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 8,
        position: 'absolute',
        bottom: '40%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    quickReactionButton: {
        padding: 8,
        marginHorizontal: 4,
    },
    emojiText: {
        fontSize: 24,
    },
    standupButton: {
        backgroundColor: '#0052CC',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    authButton: {
        backgroundColor: '#0052CC',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    authButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ChatArea;