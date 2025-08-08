import { useMemo, useState } from 'react';
import { PiMinusBold, PiPlusBold } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import clsx from 'clsx';
import Image from 'next/image';

import yellow from '../assets/decorations/yellow.svg';
import logo from '../assets/stillNeedHelp.jpg';
import { useModal } from '../pages/Layout';

interface FAQ {
  question: string;
  answer: string;
}

const FAQsAlt = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setIsModalOpen } = useModal();
  const intl = useIntl();

  const toggleFAQ = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const faqs: FAQ[] = useMemo(() => {
    return [
      {
        question: intl.formatMessage({ id: 'do-you-support-vat-invoicing-1' }),
        answer: intl.formatMessage({
          id: 'yes-pito-provide-full-vat-invoices-either-per-order-or-consolidated-by-billing-cycle-depending-on-your-preference-0',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'how-much-notice-is-required-to-change-or-cancel-a-meal-on-the-same-day-0',
        }),
        answer: intl.formatMessage({
          id: 'you-need-to-notify-us-at-least-10-hours-before-the-scheduled-delivery-time-provided-that-the-change-does-not-exceed-10-of-the-total-meal-quantity-for-that-day-0',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'how-to-manage-participants-employees-on-the-pito-cloud-canteen-system-0',
        }),
        answer: intl.formatMessage({
          id: 'the-booker-the-representative-placing-the-order-manages-the-member-list-add-remove-members-only-members-who-are-invited-or-added-to-the-company-list-can-place-meal-orders-the-list-is-automatically-updated-whenever-there-are-any-changes-0',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'how-does-pito-ensure-meal-quality-0',
        }),
        answer: intl.formatMessage({
          id: 'we-rigorously-vet-each-restaurant-partner-through-our-qa-qc-team-ensuring-strict-compliance-with-food-safety-standards-transparent-sourcing-of-ingredients-and-safe-preparation-processes-before-meals-are-served-0',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'does-pito-cloud-canteen-offer-vegetarian-or-special-diet-menus-0',
        }),
        answer: intl.formatMessage({
          id: 'yes-we-offer-flexible-vegetarian-and-special-diet-options-through-our-ordering-system-tailored-to-meet-the-specific-needs-of-each-company-0',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'how-can-i-track-and-manage-orders-on-pito-cloud-canteen-system',
        }),
        answer: intl.formatMessage({
          id: 'you-can-easily-track-and-manage-their-orders-directly-through-the-system-dashboard-allowing-real-time-updates-on-order-status-adjustments-and-cost-control-0',
        }),
      },
    ];
  }, [intl]);

  return (
    <div className="md:px-0 md:py-16 px-5 pt-16 pb-10 flex flex-col items-center gap-10 md:gap-12 relative max-w-[1024px] mx-auto">
      <div
        className="flex flex-col items-center md:gap-4 gap-3 md:w-[70%] text-center"
        style={{
          textAlign: 'center',
        }}>
        <h2 className="font-[unbounded] font-bold text-3xl md:text-[40px] md:leading-tight">
          {intl.formatMessage({ id: 'frequently-asked-and' })} <br />
          {intl.locale === 'en' && (
            <span className="text-[#D680A3] md:leading-[4rem]">
              {intl.formatMessage({ id: 'secretly-worried-about' })}
            </span>
          )}
        </h2>
        {intl.locale === 'en' && (
          <span className="md:whitespace-pre-line md:text-lg font-medium">
            {intl.formatMessage({
              id: 'have-a-question-about-our-service-or-billing-check-out-the-answers-below-if-you-still-need-help-our-team-is-just-a-message-away',
            })}
          </span>
        )}
      </div>
      {/* faqs */}
      <div className="w-full grid md:grid-cols-2 gap-4">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div key={index}>
              <button
                onClick={() => toggleFAQ(index)}
                className={clsx(
                  'w-full md:hover:!bg-gray-300 bg-[#FAFAFA] rounded-2xl p-4 flex justify-between items-center text-left font-medium text-base gap-4 md:text-lg text-black focus:outline-none cursor-pointer transition-all duration-300 ease-in-out',
                  isOpen && 'hover:!text-black',
                )}
                style={{
                  backgroundColor: isOpen ? '#000' : '#FAFAFA',
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
      <div className="border border-[#A8A8A8] bg-white  p-5 rounded-2xl w-full flex md:flex-row flex-col md:items-end justify-between gap-6">
        <div className="flex gap-4">
          <Image
            src={logo}
            className="rounded-full size-10 md:flex hidden"
            alt="logo"
          />
          <div className="flex flex-col text-text md:gap-1 gap-3">
            <div className="flex items-center gap-4">
              <Image
                src={logo}
                className="rounded-full size-10 flex md:hidden"
                alt="logo"
              />
              <span className="font-semibold text-lg font-[unbounded]">
                {intl.formatMessage({ id: 'ban-van-con-thac-mac' })}
              </span>
            </div>
            <span className="text-base leading-normal font-semibold">
              {intl.formatMessage({
                id: 'were-here-for-you-contact-our-team-and-well-assist-you-right-away',
              })}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn bg-black text-white font-[unbounded] font-semibold">
          {intl.formatMessage({ id: 'get-in-touch' })}
        </button>
      </div>
      {/* decorations */}
      {/* <Image
        src={pink}
        alt="pink decor"
        className="absolute -top-20 -rotate-90 left-0 -z-10 size-80 md:block hidden"
      /> */}
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="absolute -top-2 left-60 -z-10 size-16 md:block hidden"
      />
    </div>
  );
};

export const FAQsAltCenter = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setIsModalOpen } = useModal();
  const intl = useIntl();

  const toggleFAQ = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const faqs: FAQ[] = useMemo(() => {
    return [
      {
        question: intl.formatMessage({ id: 'do-you-support-vat-invoicing-0' }),
        answer: intl.formatMessage({
          id: 'yes-we-provide-full-vat-invoices-either-per-order-or-as-a-consolidated-invoice-by-billing-cycle-depending-on-your-preference-0',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'how-does-pito-ensure-meal-quality',
        }),
        answer: intl.formatMessage({
          id: 'we-rigorously-vet-each-restaurant-partner-through-our-qa-qc-team-ensuring-strict-compliance-with-food-safety-standards-transparent-sourcing-of-ingredients-and-safe-preparation-processes-before-meals-are-served',
        }),
      },

      {
        question: intl.formatMessage({
          id: 'how-much-notice-is-required-to-change-or-cancel-a-meal-on-the-same-day',
        }),
        answer: intl.formatMessage({
          id: 'you-need-to-notify-us-at-least-10-hours-before-the-scheduled-delivery-time-provided-that-the-change-does-not-exceed-10-of-the-total-meal-quantity-for-that-day',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'does-pito-cloud-canteen-offer-vegetarian-or-special-diet-menus',
        }),
        answer: intl.formatMessage({
          id: 'yes-we-offer-flexible-vegetarian-and-special-diet-options-through-our-ordering-system-tailored-to-meet-the-specific-needs-of-each-company',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'is-there-a-minimum-order-requirement-for-pito-cloud-canteen',
        }),
        answer: intl.formatMessage({
          id: 'yes-we-require-a-minimum-of-20-meals-per-day-with-a-commitment-of-at-least-3-meal-days-per-week',
        }),
      },
      {
        question: intl.formatMessage({
          id: 'how-can-i-track-and-manage-orders-on-pito-cloud-canteen',
        }),
        answer: intl.formatMessage({
          id: 'you-can-easily-track-and-manage-their-orders-directly-through-the-system-dashboard-allowing-real-time-updates-on-order-status-adjustments-and-cost-control',
        }),
      },
    ];
  }, [intl]);

  return (
    <div className="md:px-0 md:py-16 px-5 pt-20 pb-32 flex flex-col items-stretch gap-10 relative max-w-[1024px] mx-auto">
      <div className="flex flex-col items-stretch md:gap-4 gap-3 md:w-[80%] text-left">
        <span className="font-[unbounded] font-bold text-3xl md:text-[40px] md:leading-tight text-center md:text-left">
          {intl.formatMessage({ id: 'frequently-asked-and' })} <br />
          {intl.locale === 'en' && (
            <span className="text-[#D680A3] md:leading-[4rem]">
              {intl.formatMessage({ id: 'secretly-worried-about' })}
            </span>
          )}
        </span>
      </div>
      {/* faqs */}
      <div className="w-full grid md:grid-cols-2 gap-4">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div key={index}>
              <button
                onClick={() => toggleFAQ(index)}
                className={clsx(
                  'w-full md:hover:!bg-gray-300 bg-[#FAFAFA] rounded-2xl p-4 flex justify-between items-center text-left font-medium text-base gap-4 md:text-lg text-black focus:outline-none cursor-pointer transition-all duration-300 ease-in-out',
                  isOpen && 'hover:!text-black',
                )}
                style={{
                  backgroundColor: isOpen ? '#000' : '#FAFAFA',
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
      <div className="border border-[#A8A8A8] bg-white p-5 rounded-2xl w-full flex md:flex-row flex-col md:items-end justify-between gap-6">
        <div className="flex gap-4">
          <Image
            src={logo}
            className="rounded-full size-10 md:flex hidden"
            alt="logo"
          />
          <div className="flex flex-col text-text md:gap-1 gap-3">
            <div className="flex items-center gap-4">
              <Image
                src={logo}
                className="rounded-full size-10 flex md:hidden"
                alt="logo"
              />
              <span className="font-semibold text-lg font-[unbounded]">
                {intl.formatMessage({ id: 'still-need-help' })}
              </span>
            </div>
            <span className="text-base leading-normal font-semibold">
              {intl.formatMessage({
                id: 'were-here-for-you-contact-our-team-and-well-assist-you-right-away',
              })}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn bg-black text-white font-[unbounded] font-semibold">
          {intl.formatMessage({ id: 'get-in-touch' })}
        </button>
      </div>
      {/* decorations */}
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="absolute bottom-10 -left-10 -z-10 size-16 md:block hidden"
      />
    </div>
  );
};

export default FAQsAlt;
