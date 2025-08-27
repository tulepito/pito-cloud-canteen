import { useMemo } from 'react';
import { CgClose } from 'react-icons/cg';
import { PiCheck } from 'react-icons/pi';
import { useIntl } from 'react-intl';

const CommonProblems = () => {
  const intl = useIntl();

  const problemList = useMemo(() => {
    return [
      intl.formatMessage({ id: 'excel-zalo-and-daily-lunch-chaos' }),
      intl.formatMessage({ id: 'limited-vendor-options-repetitive-meals' }),
      intl.formatMessage({ id: 'complaints-wrong-meals-missed-orders' }),
      intl.formatMessage({
        id: 'admins-spending-too-much-time-coordinating-orders',
      }),
      intl.formatMessage({
        id: 'wrong-meals-missing-names-or-missing-portions',
      }),
      intl.formatMessage({
        id: 'not-sure-if-vendors-will-stay-consistent-or-service-will-slip',
      }),
      intl.formatMessage({ id: 'no-way-to-track-budgets-feedback-or-reports' }),
    ];
  }, [intl]);

  const solutionList = useMemo(() => {
    return [
      intl.formatMessage({ id: 'plan-once-automate-the-rest' }),
      intl.formatMessage({
        id: 'access-daily-changing-menus-from-verified-restaurants',
      }),
      intl.formatMessage({
        id: 'let-employees-pre-select-meals-via-app-or-web',
      }),
      intl.formatMessage({
        id: 'automate-the-entire-lunch-process-no-manual-work-needed',
      }),
      intl.formatMessage({
        id: 'deliver-personalized-labeled-boxes-to-the-right-person',
      }),
      intl.formatMessage({
        id: 'reliable-quality-across-all-vendors-with-pito-support-team-ready-to-resolve-any-issues-instantly',
      }),
      intl.formatMessage({
        id: 'all-in-one-dashboard-for-cost-tracking-feedback-and-invoicing',
      }),
    ];
  }, [intl]);

  return (
    <div className="md:pt-1 pt-16 pb-16 md:px-0 flex flex-col items-center gap-7 px-5 max-w-[1024px] mx-auto">
      <h2 className="font-[unbounded] font-bold text-3xl md:w-2/3 w-full text-center md:text-[40px] md:leading-tight">
        {intl.formatMessage({ id: 'common-problems' })}{' '}
        <br className="hidden md:block" />{' '}
        <span className="text-[#96A546]">
          {intl.formatMessage({ id: 'pito-solutions' })}
        </span>
      </h2>

      <div className="grid md:grid-cols-2 gap-5 md:gap-10 w-full md:px-0 mt-5">
        {/* Problems */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold w-full text-left text-lg">
            {intl.formatMessage({ id: 'if-youre-dealing-with' })}
          </h3>
          {problemList.map((problem, index) => (
            <div
              key={index}
              className="flex w-full items-start gap-3 border border-[#D7D7D7] rounded-2xl p-4">
              <div className="size-9 text-xl shrink-0 rounded-full flex items-center justify-center bg-[#F0F4F5] text-[#A8A8A8]">
                <CgClose />
              </div>
              <h3>{problem}</h3>
            </div>
          ))}
        </div>

        {/* Solutions */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold w-full text-left text-lg">
            {intl.formatMessage({ id: 'pito-helps-you-with' })}
          </h3>
          {solutionList.map((solution, index) => (
            <div
              key={index}
              className="flex w-full items-start gap-3 bg-[#C5D475] rounded-2xl p-4">
              <div className="size-7 shrink-0 rounded-full flex items-center justify-center bg-white text-[#96A546]">
                <PiCheck />
              </div>
              <h3 className="text-black">{solution}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommonProblems;
