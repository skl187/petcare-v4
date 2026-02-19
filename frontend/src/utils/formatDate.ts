// Shared date/time formatting helpers used across the frontend
// Consistent, small API: formatDate, formatTime, formatDateTime

type MaybeDate = string | Date | null | undefined;

export function formatDate(d?: MaybeDate): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN((date as Date).getTime())) return String(d);
  return (date as Date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(t?: MaybeDate): string {
  if (!t) return '—';
  const date = typeof t === 'string' ? new Date(t) : t;
  if (!isNaN((date as Date).getTime())) {
    return (date as Date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // fallback for strings like "HH:MM[:SS]"
  if (typeof t === 'string') {
    const parts = t.split(':');
    if (parts.length >= 2) {
      const hour = parseInt(parts[0], 10);
      const minute = parts[1];
      if (!isNaN(hour)) {
        const hour12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minute} ${ampm}`;
      }
    }
  }

  return String(t);
}

export function formatDateTime(dt?: MaybeDate): string {
  if (!dt) return '—';
  const date = typeof dt === 'string' ? new Date(dt) : dt;
  if (!isNaN((date as Date).getTime())) {
    // formatDate/formatTime already apply app timezone
    return `${formatDate(date)} ${formatTime(date)}`;
  }
  return String(dt);
}

export function formatDateWithTime(dateStr?: MaybeDate, timeStr?: MaybeDate): string {
  // If the date already includes a time/offset (ISO 8601), prefer that
  if (typeof dateStr === 'string' && /T/.test(dateStr)) {
    return formatDateTime(dateStr);
  }

  // If no date provided, show time alone
  if (!dateStr && timeStr) return formatTime(timeStr);

  // If date + time provided (date as yyyy-mm-dd and time as HH:MM[:SS]) combine to a local Date
  if (typeof dateStr === 'string' && typeof timeStr === 'string') {
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (dateMatch && timeMatch) {
      const year = Number(dateMatch[1]);
      const month = Number(dateMatch[2]) - 1;
      const day = Number(dateMatch[3]);
      const hour = Number(timeMatch[1]);
      const minute = Number(timeMatch[2]);
      const dt = new Date(year, month, day, hour, minute);
      return `${formatDate(dt)} ${formatTime(dt)}`;
    }
  }

  // Fallback: render what's available
  return `${formatDate(dateStr)}${timeStr ? ` ${formatTime(timeStr)}` : ''}`;
}
