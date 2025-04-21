import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import api from './api';
import { toast } from 'react-toastify';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageCallbacks = new Set();
    this.lastMessageCallbacks = new Set();
    this.processedMessageIds = new Set(); // Set to track processed message IDs
    this.processedMessageMap = new Map(); // Map message ID -> timestamp for cleanup
    this.maxStoredMessages = 500; // Maximum number of message IDs to store
    this.cleanupInterval = null; // Interval for cleanup
  }

  connect(callback) {
    if (this.connected && this.stompClient) {
      if (callback) callback();
      return;
    }
    
    console.log('Attempting to connect to WebSocket...');
    
    const socket = new SockJS('http://localhost:8080/ws');
    // Use the Client from @stomp/stompjs instead of global Stomp
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        // Enable minimal debugging to trace message flow
        if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('DISCONNECT')) {
          console.log('STOMP: ' + str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    
    this.stompClient.onConnect = (frame) => {
      console.log('WebSocket connected successfully', frame);
      this.connected = true;
      
      // Clear any previous message tracking to avoid stale state
      this.clearMessageTracking();
      
      // First subscribe to a user-specific channel for all messages
      const username = localStorage.getItem('username');
      if (username) {
        console.log('Subscribing to user-specific queue:', `/user/${username}/queue/messages`);
        this.stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
          try {
            const messageData = JSON.parse(message.body);
            console.log('Received user-specific message:', messageData);
            
            // Check for duplicate message
            if (this.isMessageProcessed(message)) {
              console.log('Skipping duplicate message:', messageData.id);
              return;
            }
            
            // Mark message as processed
            this.markMessageAsProcessed(message);
            
            // Notify all message listeners
            this.messageCallbacks.forEach(callback => {
              try {
                callback(messageData);
              } catch (err) {
                console.error('Error in message callback:', err);
              }
            });
            
            // Notify last message listeners with higher priority
            this.lastMessageCallbacks.forEach(callback => {
              try {
                callback(messageData);
              } catch (err) {
                console.error('Error in lastMessage callback:', err);
              }
            });
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      }
      
      // Then subscribe to global channel
      console.log('Subscribing to global topic: /topic/messages');
      this.stompClient.subscribe('/topic/messages', (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log('Received global message:', messageData);
          
          // Check for duplicate message
          if (this.isMessageProcessed(message)) {
            console.log('Skipping duplicate global message:', messageData.id);
            return;
          }
          
          // Mark message as processed
          this.markMessageAsProcessed(message);
          
          // Notify all message listeners
          this.messageCallbacks.forEach(callback => {
            try {
              callback(messageData);
            } catch (err) {
              console.error('Error in message callback:', err);
            }
          });
          
          // Notify all lastMessage callbacks
          this.lastMessageCallbacks.forEach(callback => {
            try {
              callback(messageData);
            } catch (err) {
              console.error('Error in lastMessage callback:', err);
            }
          });
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      // Additional subscription for message updates (read receipts, edits, etc.)
      this.stompClient.subscribe('/topic/message-updates', (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log('Received message update:', messageData);
          
          // Notify all message listeners about the update
          this.messageCallbacks.forEach(callback => {
            try {
              callback(messageData);
            } catch (err) {
              console.error('Error in message update callback:', err);
            }
          });
        } catch (error) {
          console.error('Error parsing message update:', error);
        }
      });
      
      // Start cleanup interval
      this.startCleanupInterval();
      
      if (callback) callback();
    };
    
    this.stompClient.onStompError = (error) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
      // Don't nullify stompClient as it will try to reconnect
      
      // Try to reconnect after 5 seconds if still not connected
      setTimeout(() => {
        if (!this.connected) {
          console.log('Attempting to reconnect after error...');
          this.connect(callback);
        }
      }, 5000);
    };
    
    this.stompClient.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      this.connected = false;
      
      // Try to reconnect after a short delay
      setTimeout(() => {
        if (!this.connected) {
          console.log('Attempting to reconnect after close...');
          this.connect(callback);
        }
      }, 3000);
    };
    
    // Activate the connection
    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.connected = false;
      this.subscriptions.clear();
      this.clearMessageTracking();
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      console.log('WebSocket disconnected');
    }
  }

  // Helper method to check if message is a duplicate
  isMessageProcessed(message) {
    // Extract message ID from headers or message body
    const messageId = message.headers?.messageId || 
                     (message.body && JSON.parse(message.body).id);
    
    if (!messageId) return false;
    return this.processedMessageIds.has(messageId);
  }

  // Mark a message as processed to avoid duplicates
  markMessageAsProcessed(message) {
    // Extract message ID from headers or message body
    const messageId = message.headers?.messageId || 
                     (message.body && JSON.parse(message.body).id);
    
    if (!messageId) return;
    
    this.processedMessageIds.add(messageId);
    this.processedMessageMap.set(messageId, Date.now());
    
    // If we're storing too many IDs, clean up
    if (this.processedMessageIds.size > this.maxStoredMessages) {
      this.cleanupOldMessages();
    }
  }

  // Clean up old message IDs to prevent memory leaks
  cleanupOldMessages() {
    const now = Date.now();
    const expirationTime = 30 * 60 * 1000; // 30 minutes
    
    for (const [id, timestamp] of this.processedMessageMap.entries()) {
      if (now - timestamp > expirationTime) {
        this.processedMessageIds.delete(id);
        this.processedMessageMap.delete(id);
      }
    }
  }

  // Start interval to clean up old message IDs
  startCleanupInterval() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.cleanupInterval = setInterval(() => this.cleanupOldMessages(), 10 * 60 * 1000); // Clean every 10 minutes
  }
  
  // Clear message tracking data
  clearMessageTracking() {
    this.processedMessageIds.clear();
    this.processedMessageMap.clear();
  }

  isConnected() {
    return this.connected && this.stompClient !== null;
  }

  subscribeToChatMessages(chatId, callback) {
    if (!this.stompClient || !this.connected) {
      console.warn('WebSocket not connected, cannot subscribe to chat:', chatId);
      
      // Auto-connect and then subscribe
      this.connect(() => {
        this.subscribeToChatMessages(chatId, callback);
      });
      return;
    }

    // If already subscribed, unsubscribe first
    this.unsubscribeFromChat(chatId);

    console.log(`Subscribing to chat messages for chat ${chatId}`);
    const subscription = this.stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
      try {
        const messageData = JSON.parse(message.body);
        console.log(`Received message for chat ${chatId}:`, messageData);
        
        // Check for duplicate message
        if (this.isMessageProcessed(message)) {
          console.log('Skipping duplicate chat message:', messageData.id);
          return;
        }
        
        // Mark message as processed
        this.markMessageAsProcessed(message);
        
        // Add this callback to general message callbacks temporarily
        this.messageCallbacks.add(callback);
        
        // Invoke the callback with the new message
        callback(messageData);
      } catch (error) {
        console.error('Error handling chat message:', error);
      }
    });

    this.subscriptions.set(chatId, subscription);
    
    // Also register for general message callbacks to catch messages from other sources
    this.messageCallbacks.add(callback);
  }

  unsubscribeFromChat(chatId) {
    const subscription = this.subscriptions.get(chatId);
    if (subscription) {
      try {
        subscription.unsubscribe();
        console.log(`Unsubscribed from chat ${chatId}`);
      } catch (e) {
        console.error(`Error unsubscribing from chat ${chatId}:`, e);
      }
      this.subscriptions.delete(chatId);
    }
    
    // Remove all callbacks that might be related to this chat
    // Since we don't have a way to identify them specifically, we'll have to 
    // rely on components to clean up properly on unmount
  }
  
  // Subscribe to receive updates for the last message of any chat
  subscribeToLastMessageUpdates(callback) {
    if (callback && typeof callback === 'function') {
      this.lastMessageCallbacks.add(callback);
      console.log('Added last message callback, total:', this.lastMessageCallbacks.size);
      
      // Connect if not connected
      if (!this.connected) {
        this.connect();
      }
    }
  }
  
  // Unsubscribe from last message updates
  unsubscribeFromLastMessageUpdates(callback) {
    if (callback && typeof callback === 'function') {
      this.lastMessageCallbacks.delete(callback);
      console.log('Removed last message callback', this.lastMessageCallbacks.size);
    }
  }

  // Add a method to manually notify about last message updates
  notifyLastMessageUpdate(message) {
    if (!message) return;
    
    console.log('Manually notifying about message update:', message);
    this.lastMessageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (err) {
        console.error('Error in manual message callback:', err);
      }
    });
  }
}

const websocketService = new WebSocketService();
export default websocketService;
