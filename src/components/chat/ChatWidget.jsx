import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMessageCircle, FiX, FiSend, FiLoader, FiUser, FiCpu, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const USER_ID_KEY = 'chat_user_identifier';
const CONV_KEY = 'chat_conversation_id';

function getOrCreateUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function formatTime(d) {
  const dt = new Date(d);
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const messagesEnd = useRef(null);
  const userId = useRef(getOrCreateUserId());

  const scrollToBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Find or create conversation on mount
  useEffect(() => {
    let savedConvId = localStorage.getItem(CONV_KEY);
    let cancelled = false;

    async function init() {
      if (savedConvId) {
        // Verify it still exists
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('id', savedConvId)
          .maybeSingle();

        if (conv) {
          if (!cancelled) {
            setConversationId(conv.id);
            const { data: msgs } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at');
            if (!cancelled) {
              setMessages(msgs || []);
              setLoading(false);
            }
          }
          return;
        }
        // Conversation was deleted, remove stale key
        localStorage.removeItem(CONV_KEY);
      }

      // Check if user already has a conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_identifier', userId.current)
        .eq('status', 'open')
        .order('last_message_at', { ascending: false })
        .limit(1);

      if (existing?.length > 0) {
        localStorage.setItem(CONV_KEY, existing[0].id);
        if (!cancelled) {
          setConversationId(existing[0].id);
          if (existing[0].user_name) setName(existing[0].user_name);
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', existing[0].id)
            .order('created_at');
          if (!cancelled) {
            setMessages(msgs || []);
            setLoading(false);
          }
        }
        return;
      }

      if (!cancelled) setLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Create conversation when user first opens chat
  useEffect(() => {
    if (!open || conversationId || loading) return;

    async function create() {
      const nameVal = name.trim() || 'Visitor';
      const { data: conv } = await supabase
        .from('conversations')
        .insert({
          user_identifier: userId.current,
          user_name: nameVal,
          status: 'open',
        })
        .select()
        .single();

      if (conv) {
        localStorage.setItem(CONV_KEY, conv.id);
        setConversationId(conv.id);
        if (!name.trim()) setName(conv.user_name || '');
        setMessages([]);
      }
    }

    create();
  }, [open, conversationId, loading, name]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversationId || sending) return;

    if (!name.trim()) {
      setShowNamePrompt(true);
      return;
    }

    setSending(true);
    setInput('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender: 'user',
      content: text,
    });

    if (!error) {
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    setSending(false);
  }

  async function handleSetName(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;

    if (conversationId) {
      await supabase
        .from('conversations')
        .update({ user_name: n })
        .eq('id', conversationId);
    }
    setShowNamePrompt(false);
  }

  return (
    <>
      {open && (
        <div
          className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up"
          style={{
            width: maximized ? 'calc(100vw - 2rem)' : 'min(72vw, 288px)',
            maxWidth: maximized ? 'none' : '320px',
            height: maximized ? 'calc(100vh - 2rem)' : '416px',
            maxHeight: maximized ? 'none' : '80vh',
            bottom: maximized ? '1rem' : '1rem',
            right: maximized ? '1rem' : '44px',
          }}
        >
            {/* Header */}
            <div className="bg-brand-orange text-white flex items-center justify-between px-3 py-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <FiMessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs">Live Chat</p>
                  <p className="text-[10px] text-white/80">Welcome to Marvel Slice</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => setMaximized((p) => !p)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer">
                  {maximized ? <FiMinimize2 className="w-3.5 h-3.5" /> : <FiMaximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  <FiMessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p>Start a conversation with us!</p>
                  <p className="text-xs mt-1">Ask about courses, pricing, or anything else.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gray-200 text-dark-navy rounded-br-md'
                      : 'bg-white border border-gray-200 text-dark-navy rounded-bl-md shadow-sm'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {msg.sender === 'admin' && <FiCpu className="w-3 h-3 text-gray-500" />}
                      <span className="text-[10px] font-medium opacity-70">
                        {msg.sender === 'user' ? 'You' : 'Support'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-60 text-right">{formatTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>

            {/* Name prompt */}
            {showNamePrompt && (
              <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-gray-50">
                <form onSubmit={handleSetName} className="flex gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-500/40"
                    autoFocus
                  />
                  <button type="submit" className="px-4 py-2 bg-gray-400 text-white text-sm font-semibold rounded-lg hover:bg-gray-500 transition-colors shrink-0 cursor-pointer">
                    Save
                  </button>
                </form>
              </div>
            )}

            {/* Input */}
            {!showNamePrompt && (
              <form onSubmit={handleSend} className="shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                   className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-gray-500/40"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center hover:bg-gray-500 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {sending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 z-50 w-10 h-10 rounded-full bg-brand-orange text-white shadow-lg hover:bg-brand-orange/90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <FiMessageCircle className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
