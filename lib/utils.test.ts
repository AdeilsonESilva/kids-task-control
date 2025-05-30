import { cn, formatDuration } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    expect(cn('bg-red-500', { 'text-white': true, 'font-bold': false })).toBe('bg-red-500 text-white');
  });

  it('should override conflicting classes with tailwind-merge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2'); // tailwind-merge should ensure the last conflicting class wins
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle various input types', () => {
    expect(cn('class1', null, 'class2', undefined, ['class3', 'class4'], { class5: true, class6: false })).toBe('class1 class2 class3 class4 class5');
  });

  it('should return an empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('should return an empty string for falsy inputs', () => {
    expect(cn(null, undefined, false, '')).toBe('');
  });
});

describe('formatDuration', () => {
  it('should format duration correctly for typical inputs', () => {
    expect(formatDuration(3661)).toBe('01:01:01'); // 1 hour, 1 minute, 1 second
    expect(formatDuration(60)).toBe('00:01:00');   // 1 minute
    expect(formatDuration(59)).toBe('00:00:59');   // 59 seconds
    expect(formatDuration(3600)).toBe('01:00:00'); // 1 hour
    expect(formatDuration(7200)).toBe('02:00:00'); // 2 hours
    expect(formatDuration(125)).toBe('00:02:05');  // 2 minutes 5 seconds
  });

  it('should format duration for zero seconds', () => {
    expect(formatDuration(0)).toBe('00:00:00');
  });

  it('should handle large number of seconds', () => {
    expect(formatDuration(86399)).toBe('23:59:59'); // 23 hours, 59 minutes, 59 seconds
  });

  it('should pad hours, minutes, and seconds with leading zeros if necessary', () => {
    expect(formatDuration(1)).toBe('00:00:01');
    expect(formatDuration(60)).toBe('00:01:00');
    expect(formatDuration(3600)).toBe('01:00:00');
    expect(formatDuration(3600 + 60 + 1)).toBe('01:01:01');
  });
});
