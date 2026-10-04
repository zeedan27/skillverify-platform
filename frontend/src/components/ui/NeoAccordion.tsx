import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface NeoAccordionItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export interface NeoAccordionProps {
  items: NeoAccordionItem[];
  defaultOpenId?: string;
  className?: string;
}

export const NeoAccordion: React.FC<NeoAccordionProps> = ({
  items,
  defaultOpenId,
  className,
}) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={twMerge('space-y-4 w-full', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={clsx(
              'border-2 border-black dark:border-white rounded-base overflow-hidden transition-all duration-150',
              isOpen
                ? 'shadow-none translate-x-[2px] translate-y-[2px] bg-yellow-50'
                : 'shadow-neo bg-white dark:bg-zinc-900'
            )}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-black text-base sm:text-lg select-none hover:bg-yellow-100 transition-colors"
            >
              <span className="flex-1 pr-4 text-black dark:text-white">{item.question}</span>
              <div
                className={clsx(
                  'size-7 rounded-full border-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180 bg-main'
                )}
              >
                <ChevronDown className="size-4 stroke-[3px]" />
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-2 border-t-2 border-dashed border-black dark:border-white/20 text-sm sm:text-base font-medium text-black dark:text-white/80 leading-relaxed bg-white dark:bg-zinc-900">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
