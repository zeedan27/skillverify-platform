import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Message } from '@skillverify/shared';
import { Send, MessageSquare, X, Loader2 } from 'lucide-react';
import { NeoBadge } from '../ui/NeoBadge';

interface Props {
  jobId: string;
  partnerId: string;
  partnerName: string;
  onClose: () => void;
}

export const MessageThreadModal: React.FC<Props> = ({
  jobId,
  partnerId,
  partnerName,
  onClose,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThread();
  }, [jobId, partnerId]);

  const loadThread = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/thread/${jobId}/${partnerId}`);
      setMessages(res.data.data || []);
      // Mark as read
      api.put(`/messages/read/${jobId}/${partnerId}`).catch(() => {});
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load message thread');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const res = await api.post('/messages', {
        jobId,
        recipientId: partnerId,
        body: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to deliver message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] rounded-2xl max-w-xl w-full h-[600px] flex flex-col shadow-neo-lg border-3 border-black dark:border-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b-2 border-black dark:border-white flex items-center justify-between bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neo-yellow border-2 border-black dark:border-white flex items-center justify-center shadow-neo">
              <MessageSquare className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-black dark:text-white">{partnerName}</h3>
                <NeoBadge variant="purple" size="sm" className="font-mono">
                  RULE-021
                </NeoBadge>
              </div>
              <p className="text-[11px] text-slate-600 font-bold">Verified Direct Inquiry Channel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-slate-100 shadow-neo transition text-black dark:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FFFDF5]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-black dark:text-white animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex items-center justify-center shadow-neo mb-2">
                <MessageSquare className="w-6 h-6 text-black dark:text-white" />
              </div>
              <p className="text-xs font-black uppercase text-black dark:text-white">No messages yet</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Start the direct inquiry conversation with {partnerName}.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === user?._id || m.senderId === (user as any)?.sub;
              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs font-bold border-2 border-black dark:border-white shadow-neo ${
                      isMine
                        ? 'bg-neo-yellow text-black dark:text-white'
                        : 'bg-white dark:bg-zinc-900 text-black dark:text-white'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line font-medium">{m.body}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono font-bold mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 border-t-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Message ${partnerName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-2.5 rounded-xl border-2 border-black dark:border-white bg-neo-yellow hover:bg-yellow-400 text-black dark:text-white shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition disabled:opacity-40"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-black dark:text-white" />}
          </button>
        </form>
      </div>
    </div>
  );
};
