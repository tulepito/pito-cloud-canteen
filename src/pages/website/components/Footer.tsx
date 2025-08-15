import React from 'react';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { useIntl } from 'react-intl';
import Image from 'next/image';
import Link from 'next/link';

import logo from '../assets/Logo.svg';
import boCongThuongLogo from '../assets/logo-bo-cong-thuong.webp';

import Container from './Container';

const Footer = () => {
  const intl = useIntl();

  return (
    <Container>
      <div className="grid grid-cols-2 md:gap-0 gap-10 md:px-20 px-5 py-5 text-sm">
        <Link href="/" className="col-span-2 md:col-span-1">
          <Image
            src={logo}
            alt="logo"
            className="translate-x-3 md:translate-x-0 md:w-52 w-36"
          />
        </Link>
        <div className="flex-1 lg:max-w-2xl col-span-2 md:col-span-1">
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-2 md:gap-3">
              <FiMapPin className="size-4 md:size-5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-normal text-sm md:text-base">
                  VP TP.HCM:
                </span>
                <span className="font-bold ml-1 text-sm md:text-base">
                  112 Điện Biên Phủ, Phường Tân Định, TP.HCM
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 md:gap-3">
              <FiPhone className="size-4 md:size-5flex-shrink-0" />
              <div>
                <span className="font-normal text-sm md:text-base">
                  {intl.formatMessage({ id: 'tong-dai' })}:
                </span>
                <span className="font-bold ml-1 text-sm md:text-base">
                  1900252530
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 md:gap-3">
              <FiMail className="size-4 md:size-5 flex-shrink-0" />
              <span className="font-bold text-sm md:text-base">
                hello@pito.vn
              </span>
            </div>

            {/* Certification Badge and Company Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
              <div className="flex flex-col items-start md:items-center gap-4">
                {/* Certification Badge Placeholder */}
                <Link href="/" className="col-span-2 md:col-span-1">
                  <Image
                    src={boCongThuongLogo}
                    alt="Bô công thương"
                    className="translate-x-3 md:translate-x-0 md:w-44 w-36"
                  />
                </Link>

                {/* Company Registration */}
                <div className="text-sm md:text-base font-bold">
                  {intl.formatMessage({ id: 'cong-ty-co-phan' })} PITO - MST.
                  0315684378
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm md:text-base font-normal">
                © {new Date().getFullYear()} PITO Cloud Canteen - All Rights
                Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Footer;
