import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import Image from 'next/image';

import pink from '../assets/decorations/pink.svg';

type ModalProps = {
  onClose: () => void;
  isModalOpen: boolean;
};

export const ModalForm = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceRequirements, setServiceRequirements] = useState('');
  const intl = useIntl();

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      company_name: companyName,
      email,
      phone,
      service_requirements: serviceRequirements,
    };
    const url = `https://activecampaign.pito.vn/proc.php?u=471&f=471&s=&c=0&m=0&act=sub&v=2&or=bd51ff8fcedda08477434aea129306d8&field[2]=${encodeURIComponent(
      data.company_name || '',
    )}&email=${encodeURIComponent(data.email || '')}&phone=${encodeURIComponent(
      data.phone || '',
    )}&field[106]=${encodeURIComponent(
      data.service_requirements || '',
    )}&jsonp=true`;

    try {
      await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      onClose();
      toast.success(intl.formatMessage({ id: 'gui-thanh-cong' }), {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setEmail('');
      setPhone('');
      setCompanyName('');
      setServiceRequirements('');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng kiểm tra lại thông tin', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={submitForm}>
      <div>
        <label className="text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'company-name' })}
        </label>
        <input
          type="text"
          name="company_name"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          autoFocus
          placeholder={intl.formatMessage({ id: 'enter-company-name' })}
          className="mt-1 w-full rounded-xl border border-solid border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'phone-number' })}
        </label>
        <input
          type="tel"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          pattern="^[0-9]+$"
          required
          autoComplete="tel"
          placeholder={intl.formatMessage({ id: 'enter-phone' })}
          className="mt-1 w-full rounded-xl border border-solid border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'business-email' })}
        </label>
        <input
          type="text"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
          required
          placeholder={intl.formatMessage({ id: 'enter-business-email' })}
          className="mt-1 w-full rounded-xl border border-solid border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'service-requirements' })} /{' '}
          {intl.formatMessage({ id: 'notes' })}
        </label>
        <textarea
          placeholder={intl.formatMessage({
            id: 'let-us-know-any-preferences-or-questions',
          })}
          rows={4}
          value={serviceRequirements}
          onChange={(e) => setServiceRequirements(e.target.value)}
          name="service_requirements"
          required
          autoComplete="off"
          className="mt-1 w-full rounded-xl border border-solid border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition">
        {intl.formatMessage({ id: 'send' })}
      </button>
    </form>
  );
};

const Modal = ({ onClose, isModalOpen }: ModalProps) => {
  const intl = useIntl();

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-lenis-prevent', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-lenis-prevent');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-lenis-prevent');
    };
  }, [isModalOpen]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex justify-center items-center transition-all duration-300 ease-in-out ${
        isModalOpen ? 'opacity-100 visible bg-black/20' : 'opacity-0 invisible'
      }`}>
      <div className="relative ">
        <div
          className={`bg-white w-full rounded-2xl md:rounded-3xl p-6 md:p-10 md:max-w-md max-h-[95%] overflow-auto md:w-full relative transition-all duration-300 ease-in-out ${
            isModalOpen
              ? 'opacity-100 scale-100 visible'
              : 'opacity-0 scale-90 invisible'
          }`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-black text-2xl font-semibold cursor-pointer hover:text-red-500 transition-colors duration-300 ease-in-out">
            ✕
          </button>

          {/* Heading */}
          <div className="flex flex-col items-center text-center gap-4 mb-6">
            <h2 className="text-2xl md:text-4xl font-bold font-alt leading-snug">
              {intl.formatMessage({ id: 'lets-tailor-your' })}
              <br />
              {intl.formatMessage({ id: 'lunch-solution' })}
            </h2>
            <p className="text-gray-600">
              {intl.formatMessage({
                id: 'say-goodbye-to-lunch-hassles-well-make-every-meal-easy-and-enjoyable-for-your-team',
              })}
            </p>
          </div>

          {/* Form */}
          <ModalForm onClose={onClose} />
        </div>
        {/* decorations */}
        <Image
          src={pink}
          alt="pink decoration"
          className="absolute -right-32 size-[20rem] bottom-10 -z-10 -rotate-[148deg] md:block hidden"
        />
        <div className="bg-[#F6AFCE] md:block hidden size-16 rounded-full absolute -z-10 top-80 -right-20"></div>
        <div className="bg-[#F6AFCE] md:block hidden size-40 rounded-full absolute -z-10 bottom-20 -left-20"></div>
        <div className="bg-[#F6AFCE] md:block hidden w-60 h-80 rounded-full absolute -z-10 top-20 -left-20"></div>
      </div>
    </div>
  );
};

export default Modal;
