import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, label, helperText, required, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-secondary-300"
          >
            {label}
            {required && <span className="ml-0.5 text-red-400" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={[
              error && typeof error === 'string' ? errorId : undefined,
              helperText ? helperId : undefined,
            ].filter(Boolean).join(' ') || undefined}
            className={cn(
              'flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200',
              'border-border focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-secondary-300',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus:border-red-500/50 focus:ring-red-500/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !error && (
          <p id={helperId} className="text-xs text-secondary-500">{helperText}</p>
        )}
        {error && typeof error === 'string' && (
          <p id={errorId} className="text-xs text-red-400" role="alert">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
