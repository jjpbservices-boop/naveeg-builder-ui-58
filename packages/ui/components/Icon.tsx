'use client';

import { useEffect, useState } from 'react';
import { IconInner, type IconName } from './IconInner';

type Props = React.SVGProps<SVGSVGElement> & { name: IconName; className?: string };

export function Icon(props: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render placeholder on server, icon on client
  if (!isClient) {
    return <span className="inline-block align-middle" aria-hidden="true" />;
  }

  return <IconInner {...props} />;
}

export type { IconName } from './IconInner';
