import React, { useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { ScheduleInterviewDto } from '@skillverify/shared';
import { Calendar, Clock, Video, FileText, X, Check } from 'lucide-react';
import { NeoButton } from '../ui/NeoButton';
import { NeoBadge } from '../ui/NeoBadge';

interface Props {
  jobId: string;
  candidate: {
    applicantId: string;
    fullName: string;
  };
  onClose: () => void;
  onScheduled: () => void;
}

export const ScheduleInterviewModal: React.FC<Props> = ({
  jobId,
  candidate,
  onClose,
  onScheduled,
}) => {
  const toast = useToast();
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMins, setDurationMins] = useState(45);
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt || !meetingLink) {
      toast.error('Please specify interview date, time, and meeting link');
      return;
    }

    try {
      setSubmitting(true);
      const dto: ScheduleInterviewDto = {
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMins,
        meetingLink,
        notes: notes || undefined,
      };

      await api.post(`/leaderboard/${jobId}/candidate/${candidate.applicantId}/interview`, dto);
      toast.success(`Interview invitation dispatched to ${candidate.fullName}`);
      onScheduled();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-neo-lg border-3 border-black dark:border-white animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neo-yellow border-2 border-black dark:border-white flex items-center justify-center shadow-neo">
              <Calendar className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-black dark:text-white">Schedule Interview</h3>
              <p className="text-xs font-bold text-slate-600">Candidate: {candidate.fullName}</p>
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
              Date & Time (UTC / Local) *
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
              Duration (Minutes) *
            </label>
            <input
              type="number"
              min={15}
              max={180}
              step={15}
              required
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
              Meeting URL (Google Meet, Zoom, Teams) *
            </label>
            <input
              type="url"
              required
              placeholder="https://meet.google.com/xyz-abcd-efg"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
              Interview Notes & Candidate Preparation Guide (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Please be ready to review your system design and code architecture."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-medium text-black dark:text-white focus:outline-none focus:shadow-neo transition placeholder:text-slate-400"
            />
          </div>

          <div className="pt-4 border-t-2 border-black dark:border-white flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-black uppercase text-slate-500 hover:text-black dark:text-white transition"
            >
              Cancel
            </button>
            <NeoButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Confirming...' : 'Dispatch Interview Invitation'}</span>
            </NeoButton>
          </div>
        </form>
      </div>
    </div>
  );
};
