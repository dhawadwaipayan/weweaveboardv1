import React from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: string;
  label?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'accent';
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  className,
  variant = 'default',
  disabled = false
}) => {
  const baseClasses = "flex min-h-[30px] items-center gap-2.5 justify-center text-sm font-normal whitespace-nowrap transition-colors";
  const variantClasses = {
    default: "text-[rgba(169,169,169,1)] hover:text-white",
    accent: "text-[rgba(225,255,0,1)] hover:text-[rgba(200,230,0,1)]"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <img
        src={icon}
        alt={label || ''}
        className="aspect-[1] object-contain w-3 self-stretch min-h-3 shrink-0 my-auto"
      />
      {label && (
        <span className="self-stretch my-auto">{label}</span>
      )}
    </button>
  );
};
