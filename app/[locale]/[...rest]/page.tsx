import { redirect, notFound } from 'next/navigation';
import { redirectMap } from '@/lib/redirect-map';
import { locales } from '@/lib/i18n';

export function generateStaticParams() {
  return Object.keys(redirectMap).flatMap((oldPath) =>
    locales.map((locale) => ({
      locale,
      rest: oldPath.split('/').filter(Boolean),
    }))
  );
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}) {
  const { locale, rest } = await params;
  const oldPath = '/' + rest.join('/');
  const newPath = redirectMap[oldPath];

  if (newPath) {
    redirect(`/${locale}${newPath}`);
  }

  notFound();
}
