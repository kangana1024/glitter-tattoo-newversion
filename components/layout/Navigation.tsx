'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

interface NavItem {
  key: string;
  href: string;
}

const navItems: NavItem[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'gallery', href: '/gallery' },
  { key: 'contact', href: '/contact' },
];

export default function Navigation({
  className = '',
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Main navigation">
      <ul className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`block px-3 py-2 rounded-lg font-heading text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-text-primary hover:text-primary hover:bg-primary/5'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileMenuButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-text-primary hover:text-primary hover:bg-primary/10 transition-colors"
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        )}
      </svg>
    </button>
  );
}
