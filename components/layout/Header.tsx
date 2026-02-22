'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import Container from '@/components/ui/Container';
import Navigation, { MobileMenuButton } from './Navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-primary/10 shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 shrink-0"
            aria-label="Glitter Tattoo Thailand - Home"
          >
            <span className="text-xl font-heading font-bold bg-gradient-to-r from-primary via-accent-orange to-secondary bg-clip-text text-transparent">
              Glitter Tattoo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <Navigation className="hidden md:block" />

          {/* Desktop Language Switcher */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary/10 py-4 space-y-4">
            <Navigation onNavigate={() => setMobileMenuOpen(false)} />
            <div className="px-3">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
