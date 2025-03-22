import { StreamChat } from 'stream-chat';

// Initialize Stream Chat client
export const chatClient = StreamChat.getInstance('YOUR_API_KEY'); // Replace with your Stream API key

// Helper function to connect user
export const connectUser = async (userId, userName) => {
    try {
        // Generate a user token from your backend or use a development token
        const userToken = 'YOUR_USER_TOKEN'; // Replace with actual token generation
        
        await chatClient.connectUser(
            {
                id: userId,
                name: userName,
            },
            userToken
        );
        return true;
    } catch (error) {
        console.error('Failed to connect user', error);
        return false;
    }
}; 