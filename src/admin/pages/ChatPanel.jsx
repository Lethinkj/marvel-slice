import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FiMessageCircle, FiSend, FiLoader, FiSearch, FiChevronLeft, FiCheck, FiClock } from 'react-icons/fi';

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const FILTERS = ['All', 'Open', 'Closed'];

function ConversationList({ conversations, activeId, onSelect, filter, onFilterChange, search, onSearchChange }) {
  return (
    <div className="w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-dark-navy text-base flex items-center gap-2">
            <FiMessageCircle className="w-4 h-4 text-brand-orange" />
            Chats
          </h2>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 border-0 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange/30 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-1 mt-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                filter === f ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto admin-scrollbar">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-16 px-4">
            <FiMessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">New messages will appear here.</p>
          </div>
        ) : (
          <div className="py-1">
            {conversations.map((conv) => {
              const isActive = activeId === conv.id;
              const lastMsg = conv.last_message || '';
              const preview = lastMsg.length > 70 ? lastMsg.slice(0, 70) + '…' : lastMsg;
              const unread = conv.last_message_sender === 'user' && conv.status === 'open';

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className={`w-full text-left px-4 py-3 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
                    isActive ? 'bg-[#f0f0f5]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${
                      unread ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {(conv.user_name || 'V')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-sm truncate ${unread ? 'font-bold text-dark-navy' : 'font-semibold text-gray-800'}`}>
                          {conv.user_name || 'Visitor'}
                        </p>
                        <span className="text-[11px] text-gray-400 shrink-0">{relativeTime(conv.last_message_at)}</span>
                      </div>
                      {preview && (
                        <p className={`text-xs truncate mt-0.5 ${unread ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                          {preview}
                        </p>
                      )}
                      {unread && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="w-2 h-2 rounded-full bg-brand-orange" />
                          <span className="text-[10px] text-brand-orange font-semibold">New message</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBox({ msg }) {
  const isUser = msg.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-[#f1f1f5] text-dark-navy rounded-bl-md'
          : 'bg-brand-orange text-white rounded-br-md'
      }`}>
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isUser ? 'text-gray-400' : 'text-white/70'}`}>{formatTime(msg.created_at)}</span>
          {!isUser && <FiCheck className="w-3 h-3 text-white/70" />}
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const messagesEnd = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const filtered = conversations.filter((c) => {
    if (filter === 'Open') return c.status === 'open';
    if (filter === 'Closed') return c.status === 'closed';
    return true;
  }).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.user_name || '').toLowerCase().includes(q) || (c.last_message || '').toLowerCase().includes(q);
  });

  const openCount = conversations.filter((c) => c.status === 'open').length;

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (cancelled || !data) return;

      const withLastMsg = await Promise.all(
        data.map(async (conv) => {
          const { data: msgs } = await supabase
            .from('messages')
            .select('content, sender, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);
          return {
            ...conv,
            last_message: msgs?.[0]?.content || '',
            last_message_sender: msgs?.[0]?.sender || '',
          };
        })
      );

      if (!cancelled) {
        setConversations(withLastMsg);
        setLoading(false);
      }
    }

    fetch();

    const convChannel = supabase
      .channel('admin-conversations')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations' },
        (payload) => setConversations((prev) => [{ ...payload.new, last_message: '', last_message_sender: '' }, ...prev])
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload) => setConversations((prev) => prev.map((c) => c.id === payload.new.id ? { ...c, ...payload.new } : c))
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(convChannel); };
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConv.id)
        .order('created_at');
      if (!cancelled) setMessages(data || []);
    }

    load();

    const msgChannel = supabase
      .channel(`admin-messages:${activeConv.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          setConversations((prev) => prev.map((c) =>
            c.id === activeConv.id
              ? { ...c, last_message: payload.new.content, last_message_sender: payload.new.sender, last_message_at: payload.new.created_at }
              : c
          ));
        }
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(msgChannel); };
  }, [activeConv?.id]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeConv || sending) return;

    setSending(true);
    setInput('');

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender: 'admin',
      content: text,
    });

    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConv.id);

    setSending(false);
  }

  async function handleToggleStatus(convId, currentStatus) {
    const next = currentStatus === 'open' ? 'closed' : 'open';
    await supabase.from('conversations').update({ status: next }).eq('id', convId);
    setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, status: next } : c));
    if (activeConv?.id === convId) setActiveConv((prev) => prev ? { ...prev, status: next } : prev);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <ConversationList
        conversations={filtered}
        activeId={activeConv?.id}
        onSelect={(conv) => setActiveConv(conv)}
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="shrink-0 px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setActiveConv(null)} className="lg:hidden p-1 -ml-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                {(activeConv.user_name || 'V')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-dark-navy text-sm truncate">{activeConv.user_name || 'Visitor'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${activeConv.status === 'open' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-400">{activeConv.status === 'open' ? 'Online' : 'Closed'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggleStatus(activeConv.id, activeConv.status)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                activeConv.status === 'open'
                  ? 'text-gray-400 hover:text-white hover:bg-brand-orange border-gray-200 hover:border-brand-orange'
                  : 'text-brand-orange hover:text-white hover:bg-brand-orange border-brand-orange'
              }`}
            >
              {activeConv.status === 'open' ? 'Close conversation' : 'Reopen conversation'}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#fafafa]">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-16">
                <p>No messages yet. Send a reply to start the conversation.</p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBox key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEnd} />
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="shrink-0 px-5 py-3 border-t border-gray-100 bg-white flex gap-2 items-end">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder-gray-400 resize-none"
              disabled={sending || activeConv.status === 'closed'}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || activeConv.status === 'closed'}
              className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
            >
              {sending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
          <div className="text-center">
            <FiMessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium text-gray-400">Select a conversation</p>
            <p className="text-sm text-gray-300 mt-1">Choose a chat from the left panel to start replying.</p>
          </div>
        </div>
      )}
    </div>
  );
}
