import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { TLocale } from '@src/types/utils';
import { EAppLocale } from '@src/utils/enums';
import { getLocalizedPathFromCurrentPath } from '@src/utils/i18nRoutes';

export function LanguageSwitchButton({
  showLabel = false,
}: {
  showLabel?: boolean;
}) {
  const intl = useIntl();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        !menuRef.current ||
        !btnRef.current ||
        menuRef.current.contains(e.target as Node) ||
        btnRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const FlagVI = (
    <svg
      width="20"
      viewBox="0 -4 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <rect width="28" height="20" rx="2" fill="#EA403F" />
      <path
        d="M14 12.34L10.4733 14.8541L11.7745 10.7231L8.29366 8.1459L12.6246 8.1069L14 4L15.3754 8.1069L19.7063 8.1459L16.2255 10.7231L17.5267 14.8541L14 12.34Z"
        fill="#FFFE4E"
      />
    </svg>
  );

  const FlagUS = (
    <svg
      width="20"
      viewBox="0 -4 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <path
        d="M28 0H0V1.33333H28V0ZM28 2.66667H0V4H28V2.66667ZM0 5.33333H28V6.66667H0V5.33333ZM28 8H0V9.33333H28V8ZM0 10.6667H28V12H0V10.6667ZM28 13.3333H0V14.6667H28V13.3333ZM0 16H28V17.3333H0V16ZM28 18.6667H0V20H28V18.6667Z"
        fill="#D02F44"
      />
      <rect width="12" height="9.33333" fill="#46467F" />
      <g opacity="0.9">
        <circle cx="2" cy="2" r="0.7" fill="white" />
        <circle cx="4.666" cy="2" r="0.7" fill="white" />
        <circle cx="7.333" cy="2" r="0.7" fill="white" />
        <circle cx="10" cy="2" r="0.7" fill="white" />
        <circle cx="3.333" cy="3.333" r="0.7" fill="white" />
        <circle cx="6" cy="3.333" r="0.7" fill="white" />
        <circle cx="8.667" cy="3.333" r="0.7" fill="white" />
        <circle cx="2" cy="4.667" r="0.7" fill="white" />
        <circle cx="4.666" cy="4.667" r="0.7" fill="white" />
        <circle cx="7.333" cy="4.667" r="0.7" fill="white" />
        <circle cx="10" cy="4.667" r="0.7" fill="white" />
        <circle cx="3.333" cy="6" r="0.7" fill="white" />
        <circle cx="6" cy="6" r="0.7" fill="white" />
        <circle cx="8.667" cy="6" r="0.7" fill="white" />
      </g>
    </svg>
  );

  const current =
    router.locale === EAppLocale.VI
      ? { code: 'VI', flag: FlagVI }
      : { code: 'EN', flag: FlagUS };

  // Get localized paths for language switching
  const localizedPathForVI = getLocalizedPathFromCurrentPath(
    router.pathname,
    EAppLocale.VI as TLocale,
  );
  const localizedPathForEN = getLocalizedPathFromCurrentPath(
    router.pathname,
    EAppLocale.EN as TLocale,
  );

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        className="mx-2 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        {current.flag}
        {showLabel && <span className="font-medium">{current.code}</span>}
        <span className="sr-only">Change language</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-20 mt-2 w-40 origin-top-right rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          <Link
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
            href={{ pathname: localizedPathForVI, query: router.query }}
            locale={EAppLocale.VI}>
            {FlagVI}
            <span>{intl.formatMessage({ id: 'tieng-viet' })}</span>
          </Link>
          <Link
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
            href={{ pathname: localizedPathForEN, query: router.query }}
            locale={EAppLocale.EN}>
            {FlagUS}
            <span>{intl.formatMessage({ id: 'english' })}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
