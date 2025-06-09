import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

import logo from '../assets/Logo.svg';

import Container from './Container';

const Footer = () => {
  return (
    <Container>
      <div className="grid md:grid-cols-3 grid-cols-1 md:gap-0 gap-10 md:px-20 px-5 py-5 text-sm">
        <div className="flex flex-col-reverse items-center md:flex-row md:items-end gap-4 justify-between">
          <Link href="/">
            <Image
              src={logo}
              alt="logo"
              className="translate-x-3 md:translate-x-0"
            />
          </Link>
          <div className="md:hidden flex items-center justify-end text-xl gap-3">
            <a href="" rel="noopener noreferrer" target="_blank">
              <FaFacebookF />
            </a>
            <a href="" rel="noopener noreferrer" target="_blank">
              <FaInstagram />
            </a>
            <a href="" rel="noopener noreferrer" target="_blank">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
        <div className="flex items-center justify-center text-text text-xs">
          2025 PITO Cloud Canteen - All Rights Reserved
        </div>
        <div className="md:flex hidden items-center justify-end text-xl gap-3">
          <a href="" rel="noopener noreferrer" target="_blank">
            <FaFacebookF />
          </a>
          <a href="" rel="noopener noreferrer" target="_blank">
            <FaInstagram />
          </a>
          <a href="" rel="noopener noreferrer" target="_blank">
            <FaLinkedinIn />
          </a>
        </div>
      </div>
    </Container>
  );
};

export default Footer;
