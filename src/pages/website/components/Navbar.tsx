import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useIntl } from 'react-intl';
import Image from 'next/image';
import Link from 'next/link';

import { LanguageSwitchButton } from '@components/Layout/CompanyLayout/CompanyHeader/LanguageSwitchButton';
import { enGeneralPaths } from '@src/paths';

import logo from '../assets/Logo.svg';
// eslint-disable-next-line import/no-cycle
import { useModal } from '../pages/Layout';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <div className="w-full h-[60px] md:px-4 px-5 z-[1000] fixed bg-white/50 backdrop-blur-lg flex items-center">
      <div className="max-w-[1024px] w-full mx-auto">
        <div className="flex items-center justify-between">
          <a href="/">
            <Image src={logo} alt="logo" className="md:w-16 w-14" />
          </a>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link className="btn" href={enGeneralPaths.login.index}>
              {intl.formatMessage({ id: 'log-in' })}
            </Link>
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              className="btn border border-black bg-black text-white hover:opacity-90 hover:scale-[1.01] transition-all duration-300 ease-in-out">
              {intl.formatMessage({ id: 'request-demo' })}
            </a>
            <LanguageSwitchButton showLabel />
          </div>

          {/* Hamburger Icon (Mobile Only) */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-2xl text-black focus:outline-none">
            <FiMenu />
          </button>

          {/* Mobile Menu */}
          <div
            className={`fixed inset-0 bg-white backdrop-blur-lg h-screen text-black flex flex-col items-center p-5 justify-between gap-8 transition-transform duration-300 ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
            <div className="w-full flex items-center justify-between">
              <Image src={logo} alt="logo" className="md:w-auto w-14" />
              <button
                onClick={toggleMenu}
                className="md:hidden text-2xl text-black focus:outline-none">
                <FiX />{' '}
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              <Link
                className="w-full border border-black btn text-lg py-3"
                href={enGeneralPaths.login.index}>
                {intl.formatMessage({ id: 'log-in' })}
              </Link>
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="btn border border-black bg-black text-white w-full text-lg py-3">
                {intl.formatMessage({ id: 'request-demo' })}
              </a>
              <LanguageSwitchButton showLabel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
