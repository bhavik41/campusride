import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { getSocket } from '../lib/socket';
import { formatDistanceToNow } from 'date-fns';

function Avatar({ name, avatar, size = 8 }: { name: string; avatar?: string; size?: number }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`w-${size} h-${size} rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    conversations,
    messages,
    activeConversationId,
    typingUsers,
    fetchConversations,
    fetchMessages,
    setActiveConversation,
    sendMessage,
    receiveMessage,
    receiveNotification,
    setTyping,
    clearTyping,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messages[activeConversationId] ?? []) : [];
  const activeTyping = activeConversationId ? (typingUsers[activeConversationId] ?? []) : [];

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Set active conversation from URL param
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
      fetchMessages(conversationId);
    }
  }, [conversationId, setActiveConversation, fetchMessages]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewMessage = (message: any) => {
      receiveMessage(message);
    };

    const onNotification = ({ conversationId: cid, message }: any) => {
      if (cid !== activeConversationId) {
        receiveNotification(cid, message);
      }
    };

    const onTyping = (data: { userId: string; name: string }) => {
      if (activeConversationId) setTyping(activeConversationId, data);
    };

    const onStopTyping = (data: { userId: string }) => {
      if (activeConversationId) clearTyping(activeConversationId, data.userId);
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_notification', onNotification);
    socket.on('user_typing', onTyping);
    socket.on('user_stopped_typing', onStopTyping);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message_notification', onNotification);
      socket.off('user_typing', onTyping);
      socket.off('user_stopped_typing', onStopTyping);
    };
  }, [activeConversationId, receiveMessage, receiveNotification, setTyping, clearTyping]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, activeTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, input.trim());
    setInput('');
    // Stop typing indicator
    const socket = getSocket();
    socket?.emit('typing_stop', activeConversationId);
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!activeConversationId || !socket) return;

    if (!isTyping) {
      socket.emit('typing_start', activeConversationId);
      setIsTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing_stop', activeConversationId);
      setIsTyping(false);
    }, 2000);
  };

  const selectConversation = (id: string) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Conversation list */}
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm text-gray-500 font-medium">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs mt-1">Find a ride and tap "Message Driver".</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const lastMsg = conv.messages[0];
                const isActive = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                      isActive ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                    }`}
                  >
                    <Avatar name={conv.otherUser.name} avatar={conv.otherUser.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {conv.otherUser.name}
                          {conv.otherUser.isStudent && (
                            <span className="ml-1 text-xs">🎓</span>
                          )}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5 ml-1 flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.ride.fromCity} → {conv.ride.toCity}
                      </p>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {lastMsg.senderId === user?.id ? 'You: ' : ''}
                          {lastMsg.body}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium text-gray-500">Select a conversation</p>
              <p className="text-sm mt-1">Or message a driver from a ride page</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <Avatar name={activeConv.otherUser.name} avatar={activeConv.otherUser.avatar} size={10} />
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                    {activeConv.otherUser.name}
                    {activeConv.otherUser.isStudent && <span className="text-sm">🎓</span>}
                  </div>
                  <Link
                    to={`/rides/${activeConv.rideId}`}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {activeConv.ride.fromCity} → {activeConv.ride.toCity}
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {activeMessages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No messages yet. Say hello! 👋
                  </div>
                )}

                {activeMessages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {!isMine && (
                        <Avatar name={msg.sender.name} avatar={msg.sender.avatar} size={7} />
                      )}
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p>{msg.body}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMine ? 'text-primary-200' : 'text-gray-400'
                          }`}
                        >
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                          {isMine && msg.readAt && ' · Read'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {activeTyping.length > 0 && (
                  <div className="flex items-end gap-2">
                    <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {activeTyping.map((u) => u.name).join(', ')} typing…
                    </span>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="px-4 py-3 border-t border-gray-100 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type a message…"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
