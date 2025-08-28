import React, { useEffect, useRef, useState } from 'react';
import { PiCaretDownFill, PiCaretUpFill } from 'react-icons/pi';
import Image from 'next/image';
import Link from 'next/link';

import { generalPaths } from '@src/paths';

import logo from '../assets/Logo.svg';
import logoPlatform from '../assets/logo-platform.svg';

export function LogoSwitchButton() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        className="mx-2 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-0"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        <div className="relative md:min-w-20 min-w-14 aspect-[1415/929]">
          <Image
            src={logo}
            alt="logo"
            fill
            priority
            loading="eager"
            quality={100}
          />
          <div>
            {open ? (
              <PiCaretUpFill className="size-3 absolute right-0 top-0" />
            ) : (
              <PiCaretDownFill className="size-3 absolute right-0 top-0" />
            )}
          </div>
        </div>
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute flex flex-col gap-2 left-0 z-20 mt-2 w-[80vw] md:w-[420px] origin-top-right rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          <Link
            className="flex w-full items-center gap-4 rounded-md px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
            href={generalPaths.Home}>
            <div className="relative md:min-w-14 min-w-10 aspect-[1415/929]">
              <Image
                src={logo}
                alt="logo"
                fill
                priority
                loading="eager"
                quality={100}
              />
            </div>
            <div className="flex flex-col gap-0 items-start justify-start">
              <span className="font-bold text-sm">PITO Cloud Canteen</span>
              <span className="font-semibold text-xs text-neutral-600 text-left">
                Đặt bữa trưa thông minh. Nhân viên yêu thích. HR tin dùng.
              </span>
            </div>
          </Link>
          <Link
            className="flex w-full items-center gap-4 rounded-md px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
            href="https://pito.vn">
            <Image
              src={logoPlatform}
              alt="logo"
              className="md:w-14 w-10 aspect-[32/17]"
              priority
              loading="eager"
              quality={100}
            />
            <div className="flex flex-col gap-0 items-start justify-start">
              <span className="font-bold text-sm">PITO</span>
              <span className="font-semibold text-xs text-neutral-600 text-left">
                Tất cả catering của bạn trong một nền tảng.
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
