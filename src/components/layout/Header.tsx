'use client';

import { Navigation } from './Navigation';

interface HeaderProps {
  variant?: 'default' | 'landing';
  sticky?: boolean;
}

export function Header({ variant = 'default', sticky = true }: HeaderProps) {
  return (
    <header className={sticky ? 'sticky top-0 z-50' : ''}>
      <Navigation variant={variant} />
    </header>
  );
}