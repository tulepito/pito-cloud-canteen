import { useEffect, useMemo, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { PiCaretDown } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { LanguageSwitchButton } from '@components/Layout/CompanyLayout/CompanyHeader/LanguageSwitchButton';
import { enGeneralPaths, websitePaths } from '@src/paths';

import logo from '../assets/Logo.svg';
// eslint-disable-next-line import/no-cycle
import { useModal } from '../pages/Layout';

const PlatformContent = ({ isMobile = false }) => {
  const intl = useIntl();
  const router = useRouter();

  const gridClass = isMobile
    ? 'flex flex-col gap-2'
    : 'grid grid-cols-2 gap-4 p-0 lg:p-4';

  return (
    <div className={gridClass}>
      {[
        {
          label: intl.formatMessage({ id: 'meal-box-delivery' }),
          href: websitePaths.MealBoxDelivery,
        },
        {
          label: intl.formatMessage({ id: 'cafeteria-service' }),
          href: websitePaths.PopupCanteen,
        },
      ].map((item) => (
        <div
          key={item.label}
          className={`flex flex-row items-center gap-2 transition-all duration-300 ease-linear ${
            isMobile
              ? 'rounded-lg px-3 py-2 hover:bg-neutral-100'
              : 'rounded-lg px-0 py-2 hover:bg-neutral-100 lg:px-3'
          }`}>
          <Link
            href={item.href}
            onClick={(e) => {
              if (router.pathname === item.href) {
                e.preventDefault();
              }
            }}
            className={`block whitespace-nowrap font-medium text-neutral-900 ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
};

const SolutionContent = ({ isMobile = false }) => {
  const intl = useIntl();

  const gridClass = isMobile
    ? 'flex flex-col gap-4'
    : 'grid grid-cols-3 gap-4 p-0 lg:p-4';

  return (
    <div className={gridClass}>
      {[
        {
          label: intl.formatMessage({ id: 'by-size' }),
          children: [
            {
              label: intl.formatMessage({ id: 'small-business' }),
              href: websitePaths.SmallBusiness,
            },
            {
              label: intl.formatMessage({ id: 'middle-business' }),
              href: websitePaths.MiddleBusiness,
            },
          ],
        },
        {
          label: intl.formatMessage({ id: 'by-industry' }),
          children: [
            {
              label: intl.formatMessage({ id: 'startup' }),
              href: websitePaths.Startup,
            },
          ],
        },
        {
          label: intl.formatMessage({ id: 'by-role' }),
          children: [
            {
              label: intl.formatMessage({ id: 'admins' }),
              href: websitePaths.Admin,
            },
            {
              label: intl.formatMessage({ id: 'employee' }),
              href: websitePaths.Employee,
            },
          ],
        },
      ].map((item) => (
        <div key={item.label} className={isMobile ? 'space-y-2' : 'space-y-4'}>
          <p
            className={`font-medium text-neutral-500 ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>
            {item.label}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {item.children.map((child) => (
              <Link
                key={child.label}
                href={child.href}
                className={`block whitespace-nowrap font-medium text-neutral-900 hover:underline ${
                  isMobile ? 'text-sm pl-2' : 'text-[14px] pl-4'
                }`}>
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ResourceContent = ({ isMobile = false }) => {
  const intl = useIntl();
  const router = useRouter();

  const gridClass = isMobile
    ? 'flex flex-col gap-4'
    : 'grid grid-cols-2 gap-4 p-0 lg:p-4';

  return (
    <div className={gridClass}>
      {[
        {
          label: 'Blog',
          href: 'https://pito.vn/cam-nang/blog-cloud-canteen/',
        },
        {
          label: intl.formatMessage({ id: 'become-a-partner' }),
          href: 'https://pito.vn/tro-thanh-doi-tac/',
        },
        {
          label: intl.formatMessage({ id: 'help-center' }),
          href: 'https://hotro.cloudcanteen.pito.vn/',
        },
      ].map((item) => (
        <div
          key={item.label}
          className={`flex flex-row items-center gap-2 transition-all duration-300 ease-linear col-span-1 ${
            isMobile
              ? 'rounded-lg px-3 py-2 hover:bg-neutral-100'
              : 'rounded-lg px-0 py-2 hover:bg-neutral-100 lg:px-3'
          }`}>
          <Link
            href={item.href}
            onClick={(e) => {
              if (router.pathname === item.href) {
                e.preventDefault();
              }
            }}
            className={`block whitespace-nowrap font-medium text-neutral-900 ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
};

const MobileMenuDropdown = ({
  label,
  content,
  isOpen,
  onToggle,
}: {
  label: string;
  content: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left text-lg font-medium text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors duration-200">
        <span className="font-[unbounded]">{label}</span>
        <PiCaretDown
          className={`text-lg transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-3 bg-neutral-50 rounded-b-lg">{content}</div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setActiveMobileMenu(null); // Reset mobile menu state when closing
  };

  const toggleMobileMenu = (menuLabel: string) => {
    setActiveMobileMenu((prev) => (prev === menuLabel ? null : menuLabel));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const menuItems: {
    label: string;
    content: JSX.Element;
    mobileContent: JSX.Element;
    href?: string;
  }[] = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'how-it-works-0' }),
        content: <PlatformContent />,
        mobileContent: <PlatformContent isMobile={true} />,
      },
      {
        label: intl.formatMessage({ id: 'solutions-0' }),
        content: <SolutionContent />,
        mobileContent: <SolutionContent isMobile={true} />,
      },
      {
        label: intl.formatMessage({ id: 'resources' }),
        content: <ResourceContent />,
        mobileContent: <ResourceContent isMobile={true} />,
      },
    ],
    [intl],
  );

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  // Handle click event when there is no children
  const handleClick = (href: string, hasChildren: boolean) => {
    if (hasChildren) {
      // Do nothing, let the popover display
    } else {
      // Navigate to URL when no children
      window.open(href, '_blank');
      setActiveMenu(null); // Close popover when clicking on item without children
    }
  };

  return (
    <div
      className={`w-full h-[60px] md:h-[80px] md:px-4 px-5 z-[1000] fixed bg-white flex items-center transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}>
      <div className="max-w-[1024px] w-full mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image
              src={logo}
              alt="logo"
              className="md:w-20 w-14"
              priority
              loading="eager"
              quality={100}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="relative">
            <nav
              className="hidden space-x-4 md:flex md:items-center"
              onMouseLeave={handleMouseLeave}>
              {menuItems.map((menuItem) => (
                <div
                  key={menuItem.label}
                  className="group relative"
                  onMouseEnter={() => {
                    if (menuItem?.content) {
                      setActiveMenu(menuItem.label);

                      return;
                    }

                    if (activeMenu) {
                      setActiveMenu(null);
                    }
                  }}>
                  <button
                    onClick={() =>
                      handleClick(menuItem?.href || '#', !!menuItem.content)
                    }
                    className={`group relative inline-flex items-center p-1 text-base font-medium transition-colors duration-200 ${
                      activeMenu === menuItem.label
                        ? 'text-neutral-900'
                        : 'text-neutral-600'
                    }`}>
                    <div className="flex items-center gap-1">
                      <p className="font-normal text-base font-[unbounded]">
                        {menuItem.label}
                      </p>
                      {menuItem.content && <PiCaretDown className="text-lg" />}
                    </div>

                    <span
                      className={`absolute bottom-0 left-0 h-px w-full bg-neutral-900 transition-transform duration-300 ${
                        activeMenu === menuItem.label
                          ? 'scale-x-100'
                          : 'scale-x-0'
                      } group-hover:scale-x-100`}></span>
                  </button>
                </div>
              ))}
            </nav>

            {/* Desktop Dropdown */}
            {activeMenu && (
              <div
                className="absolute left-1/2 top-[calc(100%+0px)] max-h-[80vh] -translate-x-1/2 pt-5"
                onMouseEnter={() => setActiveMenu(activeMenu)}
                onMouseLeave={handleMouseLeave}
                style={{
                  minWidth: '120%',
                }}>
                <div
                  className="size-full rounded-lg bg-white"
                  style={{
                    boxShadow: 'rgba(0,0,0,0.3) 0px 0px 10px -1px',
                  }}>
                  <div className="space-y-2">
                    {
                      menuItems.find(
                        (menuItem) => menuItem.label === activeMenu,
                      )?.content
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              className="btn hover:underline transition-all duration-300 ease-in-out font-[unbounded]"
              href={enGeneralPaths.login.index}>
              {intl.formatMessage({ id: 'log-in' })}
            </Link>
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              className="btn border border-black bg-black text-white hover:opacity-90 hover:scale-[1.01] transition-all duration-300 ease-in-out font-[unbounded]">
              {intl.formatMessage({ id: 'request-demo' })}
            </a>
            <LanguageSwitchButton showLabel />
          </div>

          {/* Mobile Hamburger Icon */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-2xl text-black focus:outline-none z-[1001]">
            {!isMenuOpen && <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-white z-[1000] transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-200">
            <Image src={logo} alt="logo" className="w-14" />
            <button
              onClick={toggleMenu}
              className="text-2xl text-black focus:outline-none">
              <FiX />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Mobile Navigation Items */}
            <div className="space-y-2 mb-6">
              {menuItems.map((menuItem) => (
                <div key={menuItem.label}>
                  {menuItem.mobileContent ? (
                    <MobileMenuDropdown
                      label={menuItem.label}
                      content={menuItem.mobileContent}
                      isOpen={activeMobileMenu === menuItem.label}
                      onToggle={() => toggleMobileMenu(menuItem.label)}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        if (menuItem.href) {
                          window.open(menuItem.href, '_blank');
                          toggleMenu();
                        }
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 text-left text-lg font-medium text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors duration-200">
                      <span className="font-[unbounded]">{menuItem.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Action Buttons */}
            <div className="space-y-3">
              <Link
                className="w-full flex items-center justify-center border border-neutral-300 rounded-lg py-3 px-4 text-base font-medium text-neutral-900 hover:bg-neutral-50 transition-colors duration-200 font-[unbounded]"
                href={enGeneralPaths.login.index}
                onClick={toggleMenu}>
                {intl.formatMessage({ id: 'log-in' })}
              </Link>
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                  toggleMenu();
                }}
                className="w-full flex items-center justify-center border border-black bg-black text-white rounded-lg py-3 px-4 text-base font-medium hover:opacity-90 transition-opacity duration-200 font-[unbounded]">
                {intl.formatMessage({ id: 'request-demo' })}
              </a>
              <div className="pt-2 text-center">
                <LanguageSwitchButton showLabel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
