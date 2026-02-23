"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import Container from "@/components/ui/Container";
import Navigation, { MobileMenuButton } from "./Navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/legacy/images/images/logo-320w.png"
              alt="Glitter Tattoo"
              width={150}
              height={60}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <Navigation className="hidden md:block" />

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <div className="w-px h-6 bg-primary/20" />
            <LanguageSwitcher />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MobileMenuButton
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary/10 py-4 space-y-4">
            <Navigation onNavigate={() => setMobileMenuOpen(false)} />
            <div className="px-3 border-t border-primary/10 pt-4">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
