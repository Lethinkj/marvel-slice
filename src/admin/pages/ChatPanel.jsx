import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FiMessageCircle, FiSend, FiLoader, FiSearch, FiChevronLeft, FiCheck, FiMail, FiPhone, FiCalendar, FiChevronDown, FiMessageSquare, FiList, FiX } from 'react-icons/fi';

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

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const FILTERS = ['All', 'Open', 'Closed'];

function ConversationList({ conversations, activeId, onSelect, filter, onFilterChange, search, onSearchChange }) {
  return (
    <div className="w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col">
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
              const preview = lastMsg.length > 70 ? lastMsg.slice(0, 70) + '\u2026' : lastMsg;
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

function useUserOnline(conv) {
  if (!conv?.last_seen_at) return conv?.status === 'open';
  const diff = Date.now() - new Date(conv.last_seen_at).getTime();
  return diff < 120000;
}

function LiveChat({ conversations, onConversationsChange }) {
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('Open');
  const [search, setSearch] = useState('');
  const messagesEnd = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);
  const userOnline = useUserOnline(activeConv);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const filtered = conversations.filter((c) => {
    const convDate = new Date(c.created_at).getTime();
    if (convDate < sevenDaysAgo) return false;
    if (filter === 'Open') return c.status === 'open';
    if (filter === 'Closed') return c.status === 'closed';
    return true;
  }).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.user_name || '').toLowerCase().includes(q) || (c.last_message || '').toLowerCase().includes(q);
  });

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
          onConversationsChange((prev) => prev.map((c) =>
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

  return (
    <div className="flex h-[calc(100vh-11rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
          <div className="shrink-0 px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                {(activeConv.user_name || 'V')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-dark-navy text-sm truncate">{activeConv.user_name || 'Visitor'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${userOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-400">{userOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setActiveConv(null)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {(activeConv.user_email || activeConv.user_phone || activeConv.reason) && (
            <div className="shrink-0 px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              {activeConv.user_email && (
                <span className="flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`mailto:${activeConv.user_email}`} className="text-brand-orange hover:underline">{activeConv.user_email}</a>
                </span>
              )}
              {activeConv.user_phone && (
                <span className="flex items-center gap-1.5">
                  <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`tel:${activeConv.user_phone}`} className="text-brand-orange hover:underline">{activeConv.user_phone}</a>
                </span>
              )}
              {activeConv.reason && (
                <span className="flex items-center gap-1.5 text-gray-600">
                  <FiMessageSquare className="w-3.5 h-3.5 text-gray-400" />
                  Reason: {activeConv.reason}
                </span>
              )}
              {activeConv.closed_at && (
                <span className="flex items-center gap-1.5 ml-auto">
                  <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                  Closed {formatDate(activeConv.closed_at)}
                </span>
              )}
            </div>
          )}

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
              className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center hover:bg-brand-orange/90 transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
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

function MessageViewer({ conversation, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at');
      if (!cancelled) { setMessages(data || []); setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [conversation.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl mx-4 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-semibold text-dark-navy text-sm">{conversation.user_name || 'Visitor'}</p>
            <p className="text-xs text-gray-400">{conversation.user_email} {conversation.user_phone ? `| ${conversation.user_phone}` : ''}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"><FiX className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/50">
          {loading ? (
            <div className="flex items-center justify-center py-10"><FiLoader className="w-6 h-6 text-gray-400 animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">
              <FiMessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p>No messages in this session</p>
              <p className="text-xs mt-1">Messages are deleted after 7 days.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#f1f1f5] text-dark-navy rounded-bl-md'
                    : 'bg-brand-orange text-white rounded-br-md'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-gray-400 text-right' : 'text-white/70'}`}>{formatTime(msg.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SessionsTable({ conversations }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewingConv, setViewingConv] = useState(null);

  const filtered = conversations.filter((c) => {
    if (filter === 'new') return c.status === 'open';
    if (filter === 'closed') return c.status === 'closed';
    return true;
  }).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.user_name || '').toLowerCase().includes(q)
      || (c.user_email || '').toLowerCase().includes(q)
      || (c.user_phone || '').toLowerCase().includes(q)
      || (c.reason || '').toLowerCase().includes(q)
      || (c.feedback || '').toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-dark-navy text-base flex items-center gap-2">
            <FiList className="w-4 h-4 text-brand-orange" />
            Chat Sessions
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-64 pl-9 pr-3 py-2 text-sm bg-gray-100 border-0 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange/30 placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-100 border-0 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="closed">Closed</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Feedback</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Closed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-16 text-gray-400">
                  <FiMessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p>No chat sessions found</p>
                </td>
              </tr>
            ) : (
              filtered.map((conv, i) => (
                <tr key={conv.id} onClick={() => setViewingConv(conv)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <td className="px-5 py-4 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                        {(conv.user_name || 'V')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-dark-navy">{conv.user_name || 'Visitor'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {conv.user_email ? (
                      <a href={`mailto:${conv.user_email}`} className="text-brand-orange hover:underline flex items-center gap-1.5">
                        <FiMail className="w-3.5 h-3.5 shrink-0" />
                        {conv.user_email}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-5 py-4">
                    {conv.user_phone ? (
                      <a href={`tel:${conv.user_phone}`} className="text-gray-600 hover:text-brand-orange flex items-center gap-1.5">
                        <FiPhone className="w-3.5 h-3.5 shrink-0" />
                        {conv.user_phone}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-5 py-4 text-gray-600 max-w-[200px] truncate">{conv.reason || '-'}</td>
                  <td className="px-5 py-4">{conv.rating ? `${conv.rating}/5` : '-'}</td>
                  <td className="px-5 py-4 text-gray-600 max-w-[200px] truncate">{conv.feedback || '-'}</td>
                  <td className="px-5 py-4">
                    {conv.issue_resolved === true ? (
                      <span className="text-green-600 text-xs font-medium">Yes</span>
                    ) : conv.issue_resolved === false ? (
                      <span className="text-red-500 text-xs font-medium">No</span>
                    ) : '-'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      conv.status === 'open'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${conv.status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {conv.status === 'open' ? 'New' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(conv.created_at)}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{conv.closed_at ? formatDate(conv.closed_at) : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {viewingConv && <MessageViewer conversation={viewingConv} onClose={() => setViewingConv(null)} />}
    </div>
  );
}

export default function ChatPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const tab = searchParams.get('tab') || 'live';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {tab === 'live' ? (
        <LiveChat conversations={conversations} onConversationsChange={setConversations} />
      ) : (
        <SessionsTable conversations={conversations} />
      )}
    </div>
  );
}
