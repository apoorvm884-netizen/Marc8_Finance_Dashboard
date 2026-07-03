import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, subMonths, addMonths, isBefore, isAfter, isWithinInterval } from 'date-fns';

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: { before?: Date; after?: Date };
  minDate?: Date;
  maxDate?: Date;
}

function DatePicker({
  date,
  onSelect,
  placeholder = 'Pick a date',
  className,
  disabled,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date());

  const days = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const result: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [currentMonth]);

  const isDisabled = (day: Date) => {
    if (minDate && isBefore(day, minDate)) return true;
    if (maxDate && isAfter(day, maxDate)) return true;
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-secondary-500',
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <span className="text-sm font-medium text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-xs font-medium text-secondary-400 py-1">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const isSelected = date && isSameDay(day, date);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const disabled = isDisabled(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelect?.(day);
                    setOpen(false);
                  }}
                  className={cn(
                    'h-8 w-8 rounded-md text-sm transition-colors',
                    !isCurrentMonth && 'text-secondary-600',
                    isCurrentMonth && !isSelected && !disabled && 'text-secondary-200 hover:bg-surface-light',
                    isSelected && 'bg-accent-500 text-white hover:bg-accent-600',
                    disabled && 'cursor-not-allowed opacity-30'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
DatePicker.displayName = 'DatePicker';

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface DateRangePickerProps {
  dateRange?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function DateRangePicker({
  dateRange,
  onSelect,
  placeholder = 'Pick a date range',
  className,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selecting, setSelecting] = React.useState<'from' | 'to'>('from');

  const days = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const result: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [currentMonth]);

  const handleDayClick = (day: Date) => {
    if (selecting === 'from') {
      onSelect?.({ from: day, to: undefined });
      setSelecting('to');
    } else {
      if (dateRange?.from && isBefore(day, dateRange.from)) {
        onSelect?.({ from: day, to: dateRange.from });
      } else {
        onSelect?.({ from: dateRange?.from, to: day });
      }
      setSelecting('from');
      setOpen(false);
    }
  };

  const isInRange = (day: Date) => {
    if (!dateRange?.from) return false;
    if (!dateRange.to) return isSameDay(day, dateRange.from);
    return isWithinInterval(day, { start: dateRange.from, end: dateRange.to });
  };

  const displayValue = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d, yy')} - ${format(dateRange.to, 'MMM d, yy')}`
      : `${format(dateRange.from, 'MMM d, yy')} - ...`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !dateRange?.from && 'text-secondary-500',
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          <span>{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <span className="text-sm font-medium text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-xs font-medium text-secondary-400 py-1">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const isSelected = dateRange?.from && (isSameDay(day, dateRange.from) || (dateRange.to && isSameDay(day, dateRange.to)));
              const isRange = isInRange(day);
              const isStart = dateRange?.from && isSameDay(day, dateRange.from);
              const isEnd = dateRange?.to && isSameDay(day, dateRange.to);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'h-8 w-8 rounded-md text-sm transition-colors',
                    !isSameMonth(day, currentMonth) && 'text-secondary-600',
                    isRange && !isSelected && 'bg-accent-500/20',
                    isStart && 'rounded-r-[0px] bg-accent-500 text-white',
                    isEnd && 'rounded-l-[0px] bg-accent-500 text-white',
                    isStart && isEnd && 'rounded-md',
                    isSelected && !isStart && !isEnd && 'bg-accent-500 text-white',
                    !isRange && !isSelected && isSameMonth(day, currentMonth) && 'text-secondary-200 hover:bg-surface-light'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
DateRangePicker.displayName = 'DateRangePicker';

export { DatePicker, DateRangePicker };
export type { DateRange };
