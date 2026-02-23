import { redirect, notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { redirectMap } from '@/lib/redirect-map';
import { locales } from '@/lib/i18n';
import {
  getAllLegacyPaths,
  getLegacyPageByPath,
  isLegacyPath,
} from '@/lib/legacy-content';
import { generatePageMetadata } from '@/components/seo/MetaTags';
import LegacyPage from '@/components/legacy/LegacyPage';
import type { Metadata } from 'next';

export function generateStaticParams() {
  const legacyPaths = getAllLegacyPaths();
  const redirectPaths = Object.keys(redirectMap);

  // Combine and deduplicate
  const allPaths = [...new Set([...legacyPaths, ...redirectPaths])];

  // Filter out paths that conflict with other paths as directory prefixes
  // e.g., /2015 conflicts with /2015/th.about_us.php
  const pathSet = new Set(allPaths);
  const safePaths = allPaths.filter((p) => {
    for (const other of pathSet) {
      if (other !== p && other.startsWith(p + '/')) {
        return false; // This path is a prefix of another, skip it
      }
    }
    return true;
  });

  return safePaths.flatMap((oldPath) =>
    locales.map((locale) => ({
      locale,
      rest: oldPath.split('/').filter(Boolean),
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}): Promise<Metadata> {
  const { locale, rest } = await params;
  const urlPath = '/' + rest.join('/');

  // Check if it's a legacy page with content
  if (isLegacyPath(urlPath)) {
    const result = getLegacyPageByPath(urlPath, locale);
    if (result) {
      const { group, content } = result;
      const isCanonical = urlPath === group.canonicalPath;

      return generatePageMetadata({
        title: content.title || `Glitter Tattoo - ${group.groupName}`,
        description: content.description || content.bodyText.slice(0, 160),
        locale,
        path: urlPath,
        keywords: group.keywords.length > 0 ? group.keywords : [
          'glitter tattoo',
          'temporary tattoo',
          'body art',
          'Thailand',
        ],
        ogImage: group.images[0]?.src,
        noindex: !isCanonical,
      });
    }
  }

  return {};
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}) {
  const { locale, rest } = await params;
  setRequestLocale(locale);
  const urlPath = '/' + rest.join('/');

  // 1. Try to render legacy page content
  if (isLegacyPath(urlPath)) {
    const result = getLegacyPageByPath(urlPath, locale);
    if (result) {
      return (
        <LegacyPage
          content={result.content}
          images={result.group.images}
        />
      );
    }
  }

  // 2. Try redirect
  const newPath = redirectMap[urlPath];
  if (newPath) {
    redirect(`/${locale}${newPath}`);
  }

  // 3. Not found
  notFound();
}
