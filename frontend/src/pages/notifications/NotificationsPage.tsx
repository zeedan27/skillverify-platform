import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
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
} from 'lucide-react';
import { NotificationType, AppNotification } from '@skillverify/shared';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const fetchNotifications = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?page=${currentPage}&limit=20`);
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        return <CheckCircle2 className="w-5 h-5 text-green-700 stroke-[2.5px]" />;
      case NotificationType.GROOMING_UNLOCKED:
        return <BookOpen className="w-5 h-5 text-amber-600 stroke-[2.5px]" />;
      case NotificationType.NEW_TOP_PERFORMER:
        return <Trophy className="w-5 h-5 text-black dark:text-white stroke-[2.5px]" />;
      case NotificationType.INTEGRITY_ALERT:
        return <AlertTriangle className="w-5 h-5 text-alert-red stroke-[2.5px]" />;
      case NotificationType.STATUS_CHANGED:
        return <ChevronRight className="w-5 h-5 text-black dark:text-white stroke-[2.5px]" />;
      case NotificationType.INTERVIEW_SCHEDULED:
        return <Calendar className="w-5 h-5 text-purple-600 stroke-[2.5px]" />;
      case NotificationType.OFFER_SENT:
        return <Gift className="w-5 h-5 text-green-700 stroke-[2.5px]" />;
      case NotificationType.MESSAGE_RECEIVED:
        return <MessageSquare className="w-5 h-5 text-blue-600 stroke-[2.5px]" />;
      case NotificationType.BADGE_EARNED:
        return <Award className="w-5 h-5 text-yellow-600 stroke-[2.5px]" />;
      default:
        return <Clock className="w-5 h-5 text-black dark:text-white stroke-[2.5px]" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <DecorativeSparkle size={32} colorClass="text-yellow-400" className="absolute top-4 right-8 hidden sm:block rotate-12" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b-2 border-dashed border-black dark:border-white/20 pb-6">
        <div>
          <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-2">
            Private Alert Stream
          </NeoBadge>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight mt-1 flex items-center gap-3">
            <div className="p-2 rounded-base bg-main border-2 border-black dark:border-white shadow-neo-sm text-black dark:text-white -rotate-2">
              <Bell className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <span>Notification Center</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-bold text-black dark:text-white/60">
            Real-time updates regarding assessments, grooming courses, and hiring pipeline statuses.
          </p>
        </div>

        {unreadCount > 0 && (
          <NeoButton
            onClick={handleMarkAllRead}
            variant="secondary"
            size="sm"
            className="self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 mr-1.5 stroke-[2.5px]" />
            <span>Mark all read</span>
          </NeoButton>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-base text-xs font-black border-2 border-black dark:border-white transition shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] ${
              filter === 'all'
                ? 'bg-main text-black dark:text-white translate-x-[2px] translate-y-[2px] shadow-none'
                : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-50'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-base text-xs font-black border-2 border-black dark:border-white transition shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-main text-black dark:text-white translate-x-[2px] translate-y-[2px] shadow-none'
                : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-50'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-alert-red text-white dark:text-black font-black border border-black dark:border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs font-bold text-black dark:text-white/50">
          Showing {filteredNotifications.length} alert{filteredNotifications.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-black dark:border-white border-t-main"></div>
          <p className="mt-4 font-black text-black dark:text-white text-sm">Fetching Alerts...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 text-center rounded-base border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo p-8">
          <Bell className="w-12 h-12 text-black dark:text-white/30 mx-auto mb-3" />
          <h3 className="text-base font-black text-black dark:text-white">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs font-bold text-black dark:text-white/60 mt-1 max-w-sm mx-auto">
            {filter === 'unread'
              ? 'You are all caught up!'
              : 'As you take assessments and receive candidate updates, status alerts will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkAsRead(n._id, n.link)}
              className={`p-4 rounded-base border-2 border-black dark:border-white transition cursor-pointer flex items-start gap-4 shadow-neo-sm hover:translate-x-1 ${
                !n.read
                  ? 'bg-yellow-50 border-3 border-black dark:border-white shadow-neo'
                  : 'bg-white dark:bg-zinc-900 hover:bg-slate-50'
              }`}
            >
              <div className="size-10 rounded-base bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-neo-sm flex items-center justify-center shrink-0">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-black truncate text-black dark:text-white`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] font-bold text-black dark:text-white/60 shrink-0 bg-white dark:bg-zinc-900 border border-black dark:border-white px-1.5 py-0.5 rounded-sm">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs font-medium text-black dark:text-white/80 leading-relaxed mb-2">
                  {n.body || (n as any).message || ''}
                </p>

                {n.link && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-black dark:text-white underline">
                    <span>View details</span>
                    <ChevronRight className="w-3 h-3 stroke-[3px]" />
                  </span>
                )}
              </div>

              {!n.read && (
                <div className="size-3 rounded-full bg-alert-red border border-black dark:border-white shrink-0 mt-2 shadow-neo-sm animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3.5 py-1.5 text-xs font-black rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-black dark:text-white font-black px-2">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3.5 py-1.5 text-xs font-black rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
