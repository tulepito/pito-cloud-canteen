import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

export const RedDotPortal = (props: PortalProps) => {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector<HTMLElement>('#redDot');
    setMounted(true);
  }, []);

  return mounted && ref.current
    ? createPortal(props.children, ref.current)
    : null;
};
