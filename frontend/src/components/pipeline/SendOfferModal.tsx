import React, { useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { SendOfferDto } from '@skillverify/shared';
import { Briefcase, DollarSign, Calendar, FileCheck, X, Check } from 'lucide-react';
import { NeoButton } from '../ui/NeoButton';

interface Props {
  jobId: string;
  candidate: {
    applicantId: string;
    fullName: string;
  };
  onClose: () => void;
  onOfferSent: () => void;
}

export const SendOfferModal: React.FC<Props> = ({
  jobId,
  candidate,
  onClose,
  onOfferSent,
}) => {
  const toast = useToast();
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState('');
  const [terms, setTerms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !startDate) {
      toast.error('Please specify annual compensation and starting date');
      return;
    }

    try {
      setSubmitting(true);
      const dto: SendOfferDto = {
        salary: {
          amount: Number(amount),
          currency,
        },
        startDate: new Date(startDate).toISOString(),
        terms: terms || undefined,
      };

      await api.post(`/leaderboard/${jobId}/candidate/${candidate.applicantId}/offer`, dto);
      toast.success(`Official offer letter extended to ${candidate.fullName}!`);
      onOfferSent();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to extend offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-neo-lg border-3 border-black dark:border-white animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neo-mint border-2 border-black dark:border-white flex items-center justify-center shadow-neo">
              <FileCheck className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-black dark:text-white">Extend Official Offer</h3>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
                Annual Compensation *
              </label>
              <input
                type="number"
                min={1}
                required
                placeholder="120000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-black text-black dark:text-white focus:outline-none focus:shadow-neo transition"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
              Anticipated Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
              Terms & Benefits Summary (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Full-time position, comprehensive medical insurance, 20 days PTO, 401(k) matching. Contingent on standard background check."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
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
              variant="success"
              size="sm"
              disabled={submitting}
              className="inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Issuing Offer...' : 'Send Official Offer'}</span>
            </NeoButton>
          </div>
        </form>
      </div>
    </div>
  );
};
