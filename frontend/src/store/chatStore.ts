import { create } from 'zustand';
import api from '../lib/api';
import { getSocket } from '../lib/socket';

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isStudent?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: ChatUser;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  rideId: string;
  ride: {
    id: string;
    fromCity: string;
    toCity: string;
    departureDate: string;
    status: string;
  };
  otherUser: ChatUser;
  messages: Message[];   // last message only (from list endpoint)
  unreadCount: number;
  participantA: string;
  participantB: string;
  createdAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;   // conversationId -> messages
  unreadTotal: number;
  typingUsers: Record<string, { userId: string; name: string }[]>;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  startConversation: (rideId: string, otherUserId: string) => Promise<Conversation>;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, body: string) => void;
  receiveMessage: (message: Message) => void;
  receiveNotification: (conversationId: string, message: Message) => void;
  setTyping: (conversationId: string, user: { userId: string; name: string }) => void;
  clearTyping: (conversationId: string, userId: string) => void;
  fetchUnreadCount: () => Promise<void>;
}

// fix: deduplicate incoming socket messages
export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadTotal: 0,
  typingUsers: {},

  fetchConversations: async () => {
    const { data } = await api.get('/chat/conversations');
    set({ conversations: data.conversations });
  },

  fetchMessages: async (conversationId) => {
    const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
    set((state) => ({
      messages: { ...state.messages, [conversationId]: data.messages },
      // Reset unread for this conversation
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  startConversation: async (rideId, otherUserId) => {
    const { data } = await api.post('/chat/conversations', { rideId, otherUserId });
    const conv: Conversation = { ...data.conversation, messages: [], unreadCount: 0 };

    set((state) => {
      const exists = state.conversations.find((c) => c.id === conv.id);
      return {
        conversations: exists
          ? state.conversations
          : [conv, ...state.conversations],
      };
    });

    // Join the socket room
    const socket = getSocket();
    socket?.emit('join_conversation', conv.id);

    return conv;
  },

  setActiveConversation: (id) => {
    const prev = get().activeConversationId;
    if (prev && prev !== id) {
      const socket = getSocket();
      socket?.emit('leave_conversation', prev);
    }
    if (id) {
      const socket = getSocket();
      socket?.emit('join_conversation', id);
    }
    set({ activeConversationId: id });
  },

  sendMessage: (conversationId, body) => {
    const socket = getSocket();
    if (!socket?.connected) return;
    socket.emit('send_message', { conversationId, body });
  },

  receiveMessage: (message) => {
    set((state) => {
      const existing = state.messages[message.conversationId] ?? [];
      // Avoid duplicates
      if (existing.find((m) => m.id === message.id)) return state;
      return {
        messages: {
          ...state.messages,
          [message.conversationId]: [...existing, message],
        },
        // Update last message in conversation list
        conversations: state.conversations.map((c) =>
          c.id === message.conversationId
            ? { ...c, messages: [message] }
            : c
        ),
      };
    });
  },

  receiveNotification: (conversationId, message) => {
    set((state) => ({
      unreadTotal: state.unreadTotal + 1,
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, unreadCount: c.unreadCount + 1, messages: [message] }
          : c
      ),
    }));
  },

  setTyping: (conversationId, user) => {
    set((state) => {
      const current = state.typingUsers[conversationId] ?? [];
      if (current.find((u) => u.userId === user.userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, user],
        },
      };
    });
  },

  clearTyping: (conversationId, userId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: (state.typingUsers[conversationId] ?? []).filter(
          (u) => u.userId !== userId
        ),
      },
    }));
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/chat/unread-count');
      set({ unreadTotal: data.count });
    } catch {
      // ignore
    }
  },
}));
