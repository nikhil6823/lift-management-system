import { MessageCircle, Send, Users, X } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { getChatContacts, getChatMessages, sendChatMessage } from '../../services/chatService';
import { formatDateTime } from '../../utils/dateHelpers';

export function ChatWindow() {
  const { user } = useAuth();
  const socket = useContext(SocketContext);
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const contactId = contact?._id;
  const conversationLabel = contact ? contact.name : 'Global chat';
  const relevant = useMemo(() => (message) => {
    if (!message.recipient) return !contactId;
    return Boolean(contactId) && [message.sender?._id, message.recipient?._id].includes(contactId) && [message.sender?._id, message.recipient?._id].includes(user?.id);
  }, [contactId, user?.id]);

  useEffect(() => {
    if (!open) return;
    getChatContacts().then(setContacts).catch((reason) => setError(reason.message));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError('');
    getChatMessages(contactId).then(setMessages).catch((reason) => setError(reason.message)).finally(() => setLoading(false));
  }, [contactId, open]);

  useEffect(() => {
    if (!socket) return undefined;
    const receive = (message) => {
      if (relevant(message)) setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
    };
    socket.on('chat:new', receive);
    return () => socket.off('chat:new', receive);
  }, [socket, relevant]);

  const submit = async (event) => {
    event.preventDefault();
    if (!body.trim()) return;
    try {
      const message = await sendChatMessage({ body, recipient: contactId || undefined });
      setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
      setBody('');
    } catch (reason) { setError(reason.message); }
  };

  return <div className={`chat-widget ${open ? 'chat-open' : ''}`}>
    {open && <section className="chat-panel" aria-label="Team chat">
      <header className="chat-header"><div><span className="eyebrow">Connected workspace</span><strong>{conversationLabel}</strong></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></header>
      <div className="chat-tabs"><button className={!contact ? 'active' : ''} onClick={() => setContact(null)}><Users size={14} />Global</button><select aria-label="Private chat contact" value={contactId || ''} onChange={(event) => setContact(contacts.find((item) => item._id === event.target.value) || null)}><option value="">Private chat…</option>{contacts.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.role}</option>)}</select></div>
      <div className="chat-messages">{loading && <p>Loading conversation…</p>}{!loading && !messages.length && <p>Start the conversation. Messages in global chat are visible to all signed-in users.</p>}{messages.map((message) => <div key={message._id} className={`chat-message ${message.sender?._id === user?.id ? 'mine' : ''}`}><strong>{message.sender?._id === user?.id ? 'You' : message.sender?.name || 'Team member'}</strong><span>{message.body}</span><small>{formatDateTime(message.createdAt)}</small></div>)}</div>
      {error && <div className="chat-error">{error}</div>}
      <form className="chat-compose" onSubmit={submit}><input value={body} onChange={(event) => setBody(event.target.value)} placeholder={`Message ${contact ? contact.name : 'everyone'}…`} maxLength="2000" /><button aria-label="Send message"><Send size={16} /></button></form>
    </section>}
    <button className="chat-launcher" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close chat' : 'Open chat'}><MessageCircle size={21} /> <span>{open ? 'Close chat' : 'Chat'}</span></button>
  </div>;
}
