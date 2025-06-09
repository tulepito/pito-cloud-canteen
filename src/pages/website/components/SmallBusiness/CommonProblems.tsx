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
    <div className="md:pt-1 pt-20 pb-20 md:px-20 flex flex-col items-center gap-7 px-5">
      <span className="font-alt font-bold text-2xl md:w-2/3 w-full text-center md:text-5xl md:leading-[3rem]">
        Common Problems, <br /> PITO Solutions
      </span>

      <div className="grid md:grid-cols-2 gap-5 w-full md:px-32">
        {/* Problems */}
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

        {/* Solutions */}
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
      </div>
    </div>
  );
};

export default CommonProblems;
