import { useState } from 'react';
import { PiMinusBold, PiPlusBold } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import pink from '../assets/decorations/pink.svg';
import yellow from '../assets/decorations/yellow.svg';
import logo from '../assets/stillNeedHelp.jpg';
import { useModal } from '../pages/Layout';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Do you support VAT invoicing?',
    answer:
      'Yes. We provide full VAT invoices either per order or as a consolidated invoice by billing cycle, depending on your preference.',
  },
  {
    question: 'How does PITO ensure meal quality?',
    answer:
      'We rigorously vet each restaurant partner through our QA/QC team, ensuring strict compliance with food safety standards, transparent sourcing of ingredients, and safe preparation processes before meals are served.',
  },

  {
    question:
      'How much notice is required to change or cancel a meal on the same day?',
    answer:
      'You need to notify us at least 10 hours before the scheduled delivery time, provided that the change does not exceed 10% of the total meal quantity for that day.',
  },
  {
    question: 'Does PITO Cloud Canteen offer vegetarian or special diet menus?',
    answer:
      'Yes. We offer flexible vegetarian and special diet options through our ordering system, tailored to meet the specific needs of each company.',
  },
  {
    question: 'Is there a minimum order requirement for PITO Cloud Canteen?',
    answer:
      'Yes. We require a minimum of 20 meals per day, with a commitment of at least 3 meal days per week.',
  },
  {
    question: 'How can I track and manage orders on PITO Cloud Canteen?',
    answer:
      'You can easily track and manage their orders directly through the system dashboard, allowing real-time updates on order status, adjustments, and cost control.',
  },
];

const FAQsAlt = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setIsModalOpen } = useModal();
  const intl = useIntl();

  const toggleFAQ = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="md:px-40 md:py-20 px-5 pt-16 pb-32 flex flex-col items-center gap-10 relative">
      <div className="flex flex-col items-center md:gap-4 gap-3 md:w-[55%] text-center">
        <span className="font-alt font-bold text-2xl md:text-4xl">
          {intl.formatMessage({ id: 'frequently-asked-and' })}{' '}
          <span className="text-[#D680A3]">
            {intl.formatMessage({ id: 'secretly-worried-about' })}
          </span>
        </span>
        <span className="text-text">
          {intl.formatMessage({
            id: 'have-a-question-about-our-service-or-billing-check-out-the-answers-below-if-you-still-need-help-our-team-is-just-a-message-away',
          })}
        </span>
      </div>
      {/* faqs */}
      <div className="w-full grid md:grid-cols-2 gap-4 max-w-4xl">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div key={index}>
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full bg-[#FAFAFA] hover:bg-[#FFCDE3] rounded-2xl p-4 flex justify-between items-center text-left font-medium text-base md:text-lg text-black focus:outline-none cursor-pointer transition-all duration-300 ease-in-out">
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
      <div className="border border-[#A8A8A8] bg-white max-w-4xl p-5 rounded-2xl w-full flex md:flex-row flex-col md:items-end justify-between gap-6">
        <div className="flex gap-4">
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
        className="absolute -top-20 -rotate-90 left-0 -z-10 size-80 md:block hidden"
      />
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="absolute -top-2 left-60 -z-10 size-16 md:block hidden"
      />
    </div>
  );
};

export default FAQsAlt;
