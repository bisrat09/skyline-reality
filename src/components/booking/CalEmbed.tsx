'use client';

import { useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { cn } from '@/lib/utils/cn';

interface CalEmbedProps {
  calLink?: string;
  className?: string;
}

const DEFAULT_CAL_LINK = 'skyline-realty/showing';

export function CalEmbed({ calLink = DEFAULT_CAL_LINK, className }: CalEmbedProps) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal('ui', {
        theme: 'light',
        styles: { branding: { brandColor: '#C4A265' } },
      });
    })();
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <Cal
        calLink={calLink}
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
        config={{ layout: 'month_view' }}
      />
    </div>
  );
}
