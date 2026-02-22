jest.mock('next-intl/navigation', () => ({
  createNavigation: jest.fn(() => ({
    Link: 'MockLink',
    redirect: 'mockRedirect',
    usePathname: 'mockUsePathname',
    useRouter: 'mockUseRouter',
    getPathname: 'mockGetPathname',
  })),
}));

import { createNavigation } from 'next-intl/navigation';
import { Link, redirect, usePathname, useRouter, getPathname } from '@/lib/navigation';

describe('navigation', () => {
  it('calls createNavigation with correct config', () => {
    expect(createNavigation).toHaveBeenCalledWith({
      locales: ['en', 'th', 'zh'],
      defaultLocale: 'th',
    });
  });

  it('exports all navigation utilities', () => {
    expect(Link).toBeDefined();
    expect(redirect).toBeDefined();
    expect(usePathname).toBeDefined();
    expect(useRouter).toBeDefined();
    expect(getPathname).toBeDefined();
  });
});
