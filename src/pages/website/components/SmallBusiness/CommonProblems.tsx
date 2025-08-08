import { CgClose } from 'react-icons/cg';
import { PiCheck } from 'react-icons/pi';

const problemList = [
  'Excel, Zalo, and daily lunch chaos',
  'Limited vendor options, repetitive meals',
  'Complaints, wrong meals, missed orders',
  'Admins spending too much time coordinating orders',
  'Wrong meals, missing names, or missing portions',
  'Not sure if vendors will stay consistent or service will slip',
  'No way to track budgets, feedback, or reports',
];

const solutionList = [
  'Plan once, automate the rest',
  'Access daily-changing menus from verified restaurants',
  'Let employees pre-select meals via app or web',
  'Automate the entire lunch process — no manual work needed',
  'Deliver personalized, labeled boxes to the right person',
  'Reliable quality across all vendors, with PITO support team ready to resolve any issues instantly',
  'All-in-one dashboard for cost tracking, feedback, and invoicing',
];

const CommonProblems = () => {
  return (
    <div className="md:pt-1 pt-16 pb-16 md:px-0 flex flex-col items-center gap-7 px-5 max-w-[1024px] mx-auto">
      <span className="font-[unbounded] font-bold text-3xl md:w-2/3 w-full text-center md:text-[40px] md:leading-tight">
        Common Problems, <br />{' '}
        <span className="text-[#96A546]">PITO Solutions</span>
      </span>

      {/* <div className="grid md:grid-cols-2 gap-5 w-full">
        <div className="flex flex-col gap-4 p-5 pb-7 border border-[#D7D7D7] rounded-3xl">
          <h3 className="font-semibold">If you&apos;re dealing with...</h3>
          {problemList.map((problem, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="size-7 shrink-0 rounded-full flex items-center justify-center bg-[#F0F4F5] text-[#A8A8A8]">
                <CgClose />
              </div>
              <span>{problem}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 p-5 pb-7 bg-[#C5D475] rounded-3xl">
          <h3 className="font-semibold">PITO helps you with...</h3>
          {solutionList.map((solution, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="size-7 shrink-0 rounded-full flex items-center justify-center bg-white text-[#96A546]">
                <PiCheck />
              </div>
              <span>{solution}</span>
            </div>
          ))}
        </div>
      </div> */}

      <div className="grid md:grid-cols-2 gap-5 md:gap-20 w-full md:px-0 mt-5">
        {/* Problems */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold w-full text-left text-lg">
            If you&apos;re dealing with..
          </h3>
          {problemList.map((problem, index) => (
            <div
              key={index}
              className="flex w-full items-start gap-3 border border-[#D7D7D7] rounded-2xl p-4">
              <div className="size-9 text-xl shrink-0 rounded-full flex items-center justify-center bg-[#F0F4F5] text-[#A8A8A8]">
                <CgClose />
              </div>
              <span>{problem}</span>
            </div>
          ))}
        </div>

        {/* Solutions */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold w-full text-left text-lg">
            PITO helps you with...
          </h3>
          {solutionList.map((solution, index) => (
            <div
              key={index}
              className="flex w-full items-start gap-3 bg-[#C5D475] rounded-2xl p-4">
              <div className="size-7 shrink-0 rounded-full flex items-center justify-center bg-white text-[#96A546]">
                <PiCheck />
              </div>
              <span className="text-black">{solution}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommonProblems;
