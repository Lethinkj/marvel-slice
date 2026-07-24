import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMessageCircle, FiX, FiSend, FiLoader, FiUser, FiCpu, FiMaximize2, FiMinimize2, FiMail, FiPhone, FiStar } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const USER_ID_KEY = 'chat_user_identifier';

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

function PreChatForm({ onSubmit, initial }) {
  const [name, setName] = useState(initial.name || '');
  const [email, setEmail] = useState(initial.email || '');
  const [phone, setPhone] = useState(initial.phone || '');
  const [reason, setReason] = useState(initial.reason || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(initial.name && initial.email && initial.phone ? 2 : 1);

  function validateStep1() {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email';
    if (!phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[\d\s+\-()]{7,15}$/.test(phone.trim())) errs.phone = 'Invalid phone number';
    return errs;
  }

  function handleNext(e) {
    e.preventDefault();
    const errs = validateStep1();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    await onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), reason: reason.trim() });
    setSubmitting(false);
  }

  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col justify-center p-6 bg-gray-50/50">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-3">
            <FiMessageCircle className="w-6 h-6 text-brand-green" />
          </div>
          <h3 className="text-sm font-bold text-dark-navy">Start a Conversation</h3>
          <p className="text-xs text-gray-500 mt-1">Share your details and we'll be right with you.</p>
        </div>
        <form onSubmit={handleNext} className="space-y-3">
          <div>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="Your Name *"
              className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
              placeholder="Email Address *"
              className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                errors.email ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: undefined })); }}
              placeholder="Phone Number *"
              className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green'
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-brand-green text-white text-sm font-semibold hover:bg-brand-green/90 transition-colors cursor-pointer"
          >
            Next
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center p-6 bg-gray-50/50">
      <div className="text-center mb-5">
        <button onClick={() => setStep(1)} className="text-xs text-brand-green hover:underline mb-2 cursor-pointer">&larr; Back</button>
        <h3 className="text-sm font-bold text-dark-navy">What brings you here?</h3>
        <p className="text-xs text-gray-500 mt-1">Tell us how we can help you.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your issue or question..."
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={!reason.trim() || submitting}
          className="w-full py-2.5 rounded-lg bg-brand-green text-white text-sm font-semibold hover:bg-brand-green/90 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Starting...' : 'Start Chat'}
        </button>
      </form>
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 cursor-pointer"
        >
          <FiStar
            className={`w-5 h-5 transition-colors ${
              star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function CloseConfirm({ onConfirm, onCancel }) {
  const [issueResolved, setIssueResolved] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (issueResolved === null) errs.resolved = 'Please select yes or no';
    if (rating === 0) errs.rating = 'Please rate your session';
    if (!feedback.trim()) errs.feedback = 'Please share your feedback';
    return errs;
  }

  async function handleConfirm() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    await onConfirm({ issueResolved, rating, feedback: feedback.trim() });
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl mx-4 p-6 w-full max-w-sm">
        <h3 className="text-sm font-bold text-dark-navy mb-4">How was your experience?</h3>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Did our admin help you resolve your issue? <span className="text-red-400">*</span></p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setIssueResolved(true); setErrors((p) => ({ ...p, resolved: undefined })); }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                issueResolved === true
                  ? 'bg-green-50 border-green-400 text-green-700'
                  : errors.resolved ? 'border-red-400' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => { setIssueResolved(false); setErrors((p) => ({ ...p, resolved: undefined })); }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                issueResolved === false
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : errors.resolved ? 'border-red-400' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              No
            </button>
          </div>
          {errors.resolved && <p className="text-xs text-red-500 mt-1">{errors.resolved}</p>}
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Rate your session <span className="text-red-400">*</span></p>
          <StarRating value={rating} onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: undefined })); }} />
          {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Feedback <span className="text-red-400">*</span></p>
          <textarea
            value={feedback}
            onChange={(e) => { setFeedback(e.target.value); if (errors.feedback) setErrors((p) => ({ ...p, feedback: undefined })); }}
            placeholder="Share your feedback about this session..."
            rows={3}
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green resize-none ${
              errors.feedback ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.feedback && <p className="text-xs text-red-500 mt-1">{errors.feedback}</p>}
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-green rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visitorInfo, setVisitorInfo] = useState({ name: '', email: '', phone: '' });
  const [showPreChat, setShowPreChat] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const messagesEnd = useRef(null);
  const userId = useRef(getOrCreateUserId());

  const scrollToBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const initChat = useCallback(async (reset) => {
    if (reset) {
      setConversationId(null);
      setMessages([]);
      setShowPreChat(false);
      setLoading(true);
    }

    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_identifier', userId.current)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing?.length > 0) {
      const conv = existing[0];
      setConversationId(conv.id);
      setVisitorInfo({ name: conv.user_name || '', email: conv.user_email || '', phone: conv.user_phone || '' });
      setShowPreChat(false);

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at');
      setMessages(msgs || []);
    } else {
      setShowPreChat(true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    initChat(false);
  }, [initChat]);

  useEffect(() => {
    if (!conversationId) return;

    const msgChannel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !open) return;

    const interval = setInterval(async () => {
      await supabase
        .from('conversations')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', conversationId);
    }, 30000);

    return () => clearInterval(interval);
  }, [conversationId, open]);

  async function handlePreChatSubmit(info) {
    const { data: conv } = await supabase
      .from('conversations')
      .insert({
        user_identifier: userId.current,
        user_name: info.name,
        user_email: info.email,
        user_phone: info.phone,
        reason: info.reason || '',
        status: 'open',
      })
      .select()
      .single();

    if (conv) {
      setVisitorInfo(info);
      setShowPreChat(false);
      setMessages([]);
      setConversationId(conv.id);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversationId || sending) return;

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

  async function handleCloseClick() {
    if (messages.length === 0) {
      if (conversationId) {
        await supabase.from('conversations').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', conversationId);
      }
      setOpen(false);
      setConversationId(null);
      setVisitorInfo({ name: '', email: '', phone: '' });
      setShowPreChat(true);
    } else {
      setShowCloseConfirm(true);
    }
  }

  async function handleConfirmClose({ issueResolved, rating, feedback }) {
    if (conversationId) {
      const { error } = await supabase
        .from('conversations')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          issue_resolved: issueResolved,
          rating,
          feedback,
        })
        .eq('id', conversationId);
      if (error) console.error('Failed to close conversation:', error);
    }
    setShowCloseConfirm(false);
    setOpen(false);
    setConversationId(null);
    setMessages([]);
    setVisitorInfo({ name: '', email: '', phone: '' });
    setShowPreChat(true);
    setLoading(false);
  }

  function handleCancelClose() {
    setShowCloseConfirm(false);
  }

  function handleOpen() {
    setOpen(true);
    initChat(true);
  }

  return (
    <>
      {open && (
        <div
          className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up"
          style={{
            width: maximized ? 'calc(100vw - 2rem)' : 'min(72vw, 288px)',
            maxWidth: maximized ? 'none' : '320px',
            height: maximized ? 'calc(100vh - 2rem)' : '440px',
            maxHeight: maximized ? 'none' : '80vh',
            bottom: maximized ? '1rem' : '1rem',
            right: maximized ? '1rem' : '44px',
          }}
        >
          <div className="bg-brand-green text-white flex items-center justify-between px-3 py-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <FiMessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs">Live Chat</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                  <span className="text-[10px] text-white/80">Admin Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setMaximized((p) => !p)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer">
                {maximized ? <FiMinimize2 className="w-3.5 h-3.5" /> : <FiMaximize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleCloseClick} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer">
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <FiLoader className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : showPreChat ? (
            <PreChatForm onSubmit={handlePreChatSubmit} initial={visitorInfo} />
          ) : (
            <>
              {visitorInfo.name && (
                <div className="shrink-0 px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />{visitorInfo.name}</span>
                  {visitorInfo.email && <span className="flex items-center gap-1"><FiMail className="w-3 h-3" />{visitorInfo.email}</span>}
                  {visitorInfo.phone && <span className="flex items-center gap-1"><FiPhone className="w-3 h-3" />{visitorInfo.phone}</span>}
                </div>
              )}

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
            </>
          )}
        </div>
      )}

      {!open && (
        <button
          onClick={handleOpen}
          className="fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 z-50 w-10 h-10 rounded-full bg-brand-green text-white shadow-lg hover:bg-brand-green/90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <FiMessageCircle className="w-5 h-5" />
        </button>
      )}

      {showCloseConfirm && (
        <CloseConfirm onConfirm={handleConfirmClose} onCancel={handleCancelClose} />
      )}
    </>
  );
}
