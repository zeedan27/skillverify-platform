import React from 'react';
import { clsx } from 'clsx';

export interface DecorativeSparkleProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  colorClass?: string;
}

export const DecorativeSparkle: React.FC<DecorativeSparkleProps> = ({
  size = 40,
  colorClass = 'text-main',
  className,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      className={clsx('pointer-events-none select-none', colorClass, className)}
      {...props}
    >
      <path
        fill="currentColor"
        stroke="#000000"
        strokeWidth="6"
        d="M195 100c-87.305 4.275-90.725 7.695-95 95-4.275-87.305-7.695-90.725-95-95 87.305-4.275 90.725-7.695 95-95 4.275 87.305 7.695 90.725 95 95"
      />
    </svg>
  );
};
