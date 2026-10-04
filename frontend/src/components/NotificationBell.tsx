import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import {
  Bell,
  CheckCheck,
  BookOpen,
  CheckCircle2,
  Trophy,
  Clock,
  AlertTriangle,
  Calendar,
  Gift,
  MessageSquare,
  Award,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { NotificationType, AppNotification } from '@skillverify/shared';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=8');
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      // User might be unauthenticated or offline
    }
  };

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: NotificationType | string) => {
    switch (type) {
      case NotificationType.QUIZ_RESULT:
        return <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />;
      case NotificationType.GROOMING_UNLOCKED:
        return <BookOpen className="w-4 h-4 text-black dark:text-white" />;
      case NotificationType.NEW_TOP_PERFORMER:
        return <Trophy className="w-4 h-4 text-black dark:text-white" />;
      case NotificationType.INTEGRITY_ALERT:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case NotificationType.STATUS_CHANGED:
        return <ChevronRight className="w-4 h-4 text-black dark:text-white" />;
      case NotificationType.INTERVIEW_SCHEDULED:
        return <Calendar className="w-4 h-4 text-black dark:text-white" />;
      case NotificationType.OFFER_SENT:
        return <Gift className="w-4 h-4 text-black dark:text-white" />;
      case NotificationType.MESSAGE_RECEIVED:
        return <MessageSquare className="w-4 h-4 text-black dark:text-white" />;
      case NotificationType.BADGE_EARNED:
        return <Award className="w-4 h-4 text-black dark:text-white" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition text-black dark:text-white"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-black dark:text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white dark:text-black border-2 border-black dark:border-white shadow-sm font-mono animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border-3 border-black dark:border-white shadow-neo-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between p-4 border-b-2 border-black dark:border-white bg-[#FFFDF5]">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wider text-black dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-neo-yellow text-black dark:text-white border border-black dark:border-white px-2 py-0.5 rounded font-mono">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-black dark:text-white hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y-2 divide-black/10">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400">
                No notifications right now
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleMarkAsRead(item._id, item.link)}
                  className={`p-3.5 transition cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                    !item.read ? 'bg-neo-yellow/20' : 'bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg border-2 border-black dark:border-white bg-[#FFFDF5] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs font-black truncate text-black dark:text-white`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {item.body || (item as any).message || ''}
                    </p>
                  </div>
                  {!item.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black dark:border-white shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-[#FFFDF5] border-t-2 border-black dark:border-white text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-black uppercase tracking-wider text-black dark:text-white hover:underline inline-flex items-center justify-center gap-1.5"
            >
              <span>View All Notifications</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
