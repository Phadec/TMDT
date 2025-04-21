import api from './api';
import websocketService from './websocketService';

const chatService = {
  getUserChats: async () => {
    try {
      const response = await api.graphql(`
        query GetUserChats {
          userChats {
            id
            participants {
              id
              username
              firstName
              lastName
              avatar
            }
            lastMessage {
              id
              content
              messageType
              imageUrl
              read
              createdAt
              senderId
              sender {
                id
                username
                firstName
                lastName
              }
            }
            product {
              id
              title
              images
              price
            }
            unreadCount
            createdAt
            updatedAt
          }
        }
      `);
      
      // Log the response to debug last message issues
      if (response.data?.data?.userChats) {
        console.log("Chat service retrieved chats with lastMessage details:", 
          response.data.data.userChats.map(chat => ({
            chatId: chat.id,
            lastMessage: chat.lastMessage ? {
              id: chat.lastMessage.id,
              content: chat.lastMessage.content,
              messageType: chat.lastMessage.messageType,
              createdAt: chat.lastMessage.createdAt
            } : null
          }))
        );
      }
      
      return response.data?.data?.userChats || [];
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  },

  getChatMessages: async (chatId, page = 0, size = 20) => {
    try {
      console.log(`Đang lấy tin nhắn cho chat ${chatId}, trang ${page}, số lượng ${size}`);
      const response = await api.graphql(`
        query GetChatMessages($chatId: ID!, $page: Int!, $size: Int!) {
          chatMessages(chatId: $chatId, page: $page, size: $size) {
            id
            content
            messageType
            imageUrl
            read
            createdAt
            senderId
            sender {
              id
              username
              firstName
              lastName
              avatar
            }
          }
        }
      `, { chatId, page, size });

      console.log("Phản hồi tin nhắn chat:", response.data);
      
      if (response.data.errors) {
        console.error("Lỗi khi lấy tin nhắn:", response.data.errors);
        return [];
      }
      
      // Log để kiểm tra messageType và imageUrl có được trả về đúng không
      const messages = response.data?.data?.chatMessages || [];
      console.log("Tin nhắn có hình ảnh:", messages.filter(msg => msg.messageType === 'IMAGE'));
      
      return messages;
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn chat:', error);
      return [];
    }
  },

  sendMessage: async (chatId, content, messageType = 'TEXT', imageUrl = null) => {
    try {
      console.log('Sending message with parameters:', { chatId, content, messageType, imageUrl });
      
      const response = await api.graphql(`
        mutation SendMessage($chatId: ID!, $content: String!, $messageType: MessageType!, $imageUrl: String) {
          sendMessage(chatId: $chatId, content: $content, messageType: $messageType, imageUrl: $imageUrl) {
            id
            content
            messageType
            imageUrl
            read
            createdAt
            senderId
            chatId
            sender {
              id
              username
              firstName
              lastName
              avatar
            }
          }
        }
      `, { chatId, content, messageType, imageUrl });
      
      const sentMessage = response.data?.data?.sendMessage;
      console.log('Server response for sent message:', sentMessage);
      
      if (sentMessage) {
        // Manually trigger WebSocket update in case the backend notification failed
        setTimeout(() => {
          console.log('Manual fallback: triggering message update notification');
          websocketService.notifyLastMessageUpdate(sentMessage);
        }, 500);
        
        return sentMessage;
      } else {
        console.error('No message returned from server:', response.data);
        if (response.data?.errors) {
          console.error('GraphQL errors:', response.data.errors);
          throw new Error('Server error: ' + response.data.errors[0].message);
        }
        throw new Error('Failed to send message: No response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  createChat: async (sellerId, productId = null) => {
    try {
      const response = await api.graphql(`
        mutation CreateChat($sellerId: ID!, $productId: ID) {
          createChat(sellerId: $sellerId, productId: $productId) {
            id
            participants {
              id
              username
              firstName
              lastName
              avatar
            }
            lastMessage {
              id
              content
              imageUrl
              messageType
              createdAt
            }
          }
        }
      `, { sellerId, productId });

      return response.data.data.createChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  markMessagesAsRead: async (chatId) => {
    try {
      const response = await api.graphql(`
        mutation MarkMessagesAsRead($chatId: ID!) {
          markMessagesAsRead(chatId: $chatId)
        }
      `, { chatId });

      return response.data.data.markMessagesAsRead;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  },

  getChatWithSeller: async (sellerId, productId = null) => {
    try {
      const response = await api.graphql(`
        query GetChatWithSeller($sellerId: ID!, $productId: ID) {
          chatWithSeller(sellerId: $sellerId, productId: $productId) {
            id
            participants
            product {
              id
              title
              images
            }
            lastMessage {
              id
              content
              createdAt
            }
            createdAt
          }
        }
      `, { sellerId, productId });

      return response.data.data.chatWithSeller;
    } catch (error) {
      console.error('Error fetching chat with seller:', error);
      return null;
    }
  },

  chat: async (chatId) => {
    try {
      const response = await api.graphql(`
        query GetChat($id: ID!) {
          chat(id: $id) {
            id
            participants {
              id
              username
              firstName
              lastName
              avatar
            }
            lastMessage {
              id
              content
              imageUrl
              messageType
              createdAt
              senderId
              sender {
                id
                username
                firstName
                lastName
              }
            }
            product {
              id
              title
              images
              price
            }
            unreadCount
            createdAt
            updatedAt
          }
        }
      `, { id: chatId });

      return response.data?.data?.chat;
    } catch (error) {
      console.error('Error fetching chat details:', error);
      return null;
    }
  },

  uploadImage: async (file) => {
    try {
      // Convert file to FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Use REST API instead of GraphQL for file upload
      const response = await api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to upload image');
      }
      
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  refreshChatList: async () => {
    try {
      const response = await api.graphql(`
        query GetUserChats {
          userChats {
            id
            participants {
              id
              username
              firstName
              lastName
              avatar
            }
            lastMessage {
              id
              content
              messageType
              imageUrl
              read
              createdAt
              senderId
              sender {
                id
                username
                firstName
                lastName
              }
            }
            product {
              id
              title
              images
              price
            }
            unreadCount
            createdAt
            updatedAt
          }
        }
      `);
      
      return response.data?.data?.userChats || [];
    } catch (error) {
      console.error('Error refreshing chat list:', error);
      throw error;
    }
  }
};

export default chatService;
