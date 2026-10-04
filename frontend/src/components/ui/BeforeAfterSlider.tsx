import React, { useState, useRef, useCallback } from 'react';
import { GripVertical } from 'lucide-react';
import { clsx } from 'clsx';

export interface BeforeAfterSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeLabel = 'Unverified Claims',
  afterLabel = 'SkillVerify Certified',
  beforeContent,
  afterContent,
  className,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(60);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(10, Math.min(90, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const startDragging = () => {
    isDragging.current = true;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={stopDragging}
      onTouchEnd={stopDragging}
      onMouseLeave={stopDragging}
      className={clsx(
        'relative w-full h-[360px] sm:h-[420px] md:h-[460px] overflow-hidden rounded-base border-4 border-black dark:border-white shadow-neo-lg select-none bg-slate-900',
        className
      )}
    >
      {/* Before Pill Label */}
      <div className="absolute top-3 left-3 z-30 bg-alert-red text-white dark:text-black text-xs sm:text-sm font-black px-3 py-1 rounded-base border-2 border-black dark:border-white shadow-neo-sm">
        {beforeLabel}
      </div>

      {/* After Pill Label */}
      <div className="absolute top-3 right-3 z-30 bg-success-mint text-black dark:text-white text-xs sm:text-sm font-black px-3 py-1 rounded-base border-2 border-black dark:border-white shadow-neo-sm">
        {afterLabel}
      </div>

      {/* Right Side (After) Full Content Layer */}
      <div className="absolute inset-0 w-full h-full">
        {afterContent}
      </div>

      {/* Left Side (Before) Clipped Content Layer */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {beforeContent}
      </div>

      {/* Divider Line and Draggable Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 w-1 bg-black dark:bg-white"
        style={{ left: `${sliderPosition}%` }}
      >
        <button
          type="button"
          onMouseDown={startDragging}
          onTouchStart={startDragging}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 size-8 sm:size-10 rounded-full border-2 border-black dark:border-white shadow-neo-sm flex items-center justify-center cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
          aria-label="Drag comparison slider"
        >
          <GripVertical className="size-4 sm:size-5 text-black dark:text-white stroke-[3px]" />
        </button>
      </div>
    </div>
  );
};
