import { useState } from 'react';
import { PiMinusBold, PiPlusBold } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import lemon from '../assets/decorations/lemon.svg';
import pink from '../assets/decorations/pink.svg';
import yellow from '../assets/decorations/yellow.svg';
import logo from '../assets/stillNeedHelp.jpg';
import { useModal } from '../pages/Layout';

interface FAQ {
  question: string;
  answer: string;
}

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setIsModalOpen } = useModal();
  const intl = useIntl();

  const faqs: FAQ[] = [
    {
      question: intl.formatMessage({ id: 'how-can-i-track-costs-and-orders' }),
      answer: intl.formatMessage({
        id: 'youll-have-access-to-a-management-dashboard-where-you-can-monitor-each-order-track-costs-by-team-or-department-and-view-participant-ratings-for-every-meal-so-youll-know-exactly-how-satisfied-your-employees-are',
      }),
    },
    {
      question: intl.formatMessage({ id: 'do-you-support-vat-invoicing' }),
      answer: intl.formatMessage({
        id: 'yes-pito-provide-full-vat-invoices-either-per-order-or-consolidated-by-billing-cycle-depending-on-your-preference',
      }),
    },
    {
      question: intl.formatMessage({
        id: 'how-to-manage-participants-employees-on-the-pito-cloud-canteen-system',
      }),
      answer: intl.formatMessage({
        id: 'the-booker-the-representative-placing-the-order-manages-the-member-list-add-remove-members-only-members-who-are-invited-or-added-to-the-company-list-can-place-meal-orders-the-list-is-automatically-updated-whenever-there-are-any-changes',
      }),
    },
    {
      question: intl.formatMessage({
        id: 'how-does-the-payment-cycle-and-invoicing-work',
      }),
      answer: intl.formatMessage({
        id: 'we-offer-flexible-payment-options-based-on-your-companys-needs-weekly-biweekly-or-monthly-plus-all-orders-come-with-a-vat-invoice-for-your-convenience',
      }),
    },
    {
      question: intl.formatMessage({
        id: 'can-i-adjust-the-number-of-meals-per-day',
      }),
      answer: intl.formatMessage({
        id: 'yes-our-system-allows-allows-you-to-flexibly-adjust-increase-decrease-the-number-of-meals-at-least-10-hours-before-delivery-with-a-maximum-adjustment-of-10-of-the-total-order',
      }),
    },
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="px-5 md:px-40 py-16 flex flex-col items-center gap-10 relative">
      <div className="flex flex-col items-center md:gap-4 gap-3 md:w-[55%] text-center">
        <span className="font-alt font-bold text-2xl md:text-[42px] leading-tight">
          {intl.formatMessage({ id: 'got-questions' })}
        </span>
        <span className="text-text md:whitespace-pre-line">
          {intl.formatMessage({
            id: 'have-a-question-about-our-service-or-billing-check-out-the-answers-below-if-you-still-need-help-our-team-is-just-a-message-away',
          })}
        </span>
      </div>
      {/* faqs */}
      <div className="w-full flex flex-col gap-4 max-w-2xl">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div key={index}>
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full hover:!bg-gray-300 bg-[#FAFAFA] rounded-2xl p-4 flex justify-between items-center text-left font-medium text-base md:text-lg text-black focus:outline-none cursor-pointer transition-all duration-300 ease-in-out"
                style={{
                  backgroundColor: !isOpen ? '#FAFAFA' : '#000',
                  color: !isOpen ? '#000' : '#FAFAFA',
                }}>
                {faq.question}
                <span className="text-[#A8A8A8] text-xl">
                  {isOpen ? <PiMinusBold /> : <PiPlusBold />}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-32 my-5' : 'max-h-0'
                }`}>
                {isOpen && <p>{faq.answer}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border border-[#A8A8A8] bg-white max-w-2xl p-5 rounded-2xl w-full flex md:flex-row flex-col md:items-end justify-between gap-6">
        <div className="flex gap-4 md:w-1/2">
          <Image
            src={logo}
            className="rounded-full size-10 md:flex hidden"
            alt="logo"
          />
          <div className="flex flex-col text-text md:gap-0 gap-3">
            <div className="flex items-center gap-4">
              <Image
                src={logo}
                className="rounded-full size-10 flex md:hidden"
                alt="logo"
              />
              <span className="font-semibold text-lg">
                {intl.formatMessage({ id: 'still-need-help' })}
              </span>
            </div>
            <span className="text-sm">
              {intl.formatMessage({
                id: 'were-here-for-you-contact-our-team-and-well-assist-you-right-away',
              })}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn bg-black text-white">
          {intl.formatMessage({ id: 'get-in-touch' })}
        </button>
      </div>
      {/* decorations */}
      <Image
        src={pink}
        alt="pink decor"
        className="absolute -rotate-90 left-0 -z-10 size-80 md:block hidden"
      />
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="absolute top-36 left-60 -z-10 size-16 md:block hidden"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="absolute -bottom-5 right-72 -z-10 size-40 rotate-3 md:block hidden"
      />
    </div>
  );
};

export default FAQs;
