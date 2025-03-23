import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Animated, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

const Sidebar = ({ translateX, toggleDrawer, selectedChannel, setSelectedChannel, selectedDM, setSelectedDM }) => {
    // Add direct messages data
    const directMessages = [
        { id: '1', name: 'John Doe', status: 'online' },
        { id: '2', name: 'Jane Smith', status: 'offline' },
        { id: '3', name: 'Mike Johnson', status: 'away' },
        // Add more contacts as needed
    ];

    // Add channels data
    const channels = ['general', 'random', 'announcements'];

    // State for search input
    const [searchQuery, setSearchQuery] = useState('');

    // Function to handle DM selection
    const handleDMSelect = (contact) => {
        setSelectedChannel(null); // Deselect channel when selecting DM
        setSelectedDM(contact);
        toggleDrawer(false);
    };

    // Function to handle channel selection
    const handleChannelSelect = (channel) => {
        setSelectedDM(null); // Deselect DM when selecting channel
        setSelectedChannel(channel);
        toggleDrawer(false);
    };

    // Filter direct messages based on search query
    const filteredDirectMessages = directMessages.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter channels based on search query
    const filteredChannels = channels.filter(channel =>
        channel.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Animated.View style={[
            styles.sidebar,
            {
                transform: [{ translateX }],
                zIndex: 2,
            }
        ]}>
            {/* Workspace Header */}
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
                    value={searchQuery}
                    onChangeText={setSearchQuery}
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

                {/* Filtered Channel List */}
                {filteredChannels.map(channel => (
                    <TouchableOpacity 
                        key={channel}
                        style={[
                            styles.channelItem,
                            selectedChannel === channel && styles.selectedChannel
                        ]}
                        onPress={() => handleChannelSelect(channel)}
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

                {/* Filtered DM List */}
                {filteredDirectMessages.map(contact => (
                    <TouchableOpacity
                        key={contact.id}
                        style={[
                            styles.dmItem,
                            selectedDM?.id === contact.id && styles.selectedItem
                        ]}
                        onPress={() => handleDMSelect(contact)}
                    >
                        <View style={styles.dmIconContainer}>
                            <Icon 
                                name="person-circle" 
                                size={24} 
                                color={selectedDM?.id === contact.id ? '#FFFFFF' : '#616061'} 
                            />
                            <View style={[styles.statusIndicator, { backgroundColor: contact.status === 'online' ? '#2BAC76' : contact.status === 'away' ? '#FFC107' : '#616061' }]} />
                        </View>
                        <Text style={[styles.dmText, selectedDM?.id === contact.id && styles.selectedText, { fontWeight: 'bold' }]}>
                            {contact.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: DRAWER_WIDTH,
        backgroundColor: '#2E5339',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    workspaceHeader: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#8B3535',
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
    dmIconContainer: {
        position: 'relative',
        marginRight: 8,
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    dmText: {
        color: '#616061',
        fontSize: 15,
        fontWeight: 'bold',
    },
    selectedItem: {
        backgroundColor: '#8B3535',
    },
    selectedText: {
        color: '#FFFFFF',
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
    workspaceIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 8,
    },
    channelIcon: {
        marginRight: 12,
    },
});

export default Sidebar;