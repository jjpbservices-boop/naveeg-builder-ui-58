'use client';

import { IconInner, type IconName } from './IconInner';

type Props = React.SVGProps<SVGSVGElement> & { name: IconName; className?: string };

export function Icon(props: Props) {
  return <IconInner {...props} />;
}

export type { IconName } from './IconInner';
