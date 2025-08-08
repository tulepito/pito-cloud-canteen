import { CgClose } from 'react-icons/cg';
import { PiFileText, PiForkKnife, PiLaptop } from 'react-icons/pi';

const problemList = [
  'Admins spend hours every day handling lunch orders manually',
  'Difficulty tracking feedback and generating detailed reports',
  'Limited meal options, repetitive menus, and lack of variety',
];

const solutionList = [
  {
    icon: <PiFileText className="text-[#96A546]" />,
    text: 'Automate weekly menus, segmented by department or team',
  },
  {
    icon: <PiLaptop className="text-[#96A546]" />,
    text: 'A centralized dashboard to track feedback, costs, and orders in one place',
  },
  {
    icon: <PiForkKnife className="text-[#96A546]" />,
    text: 'Access to over 100+ trusted restaurants, with rotating menus every day',
  },
];

const CommonProblems = () => {
  return (
    <div className="pt-16 md:pb-16 md:px-0 flex flex-col items-center gap-7 px-5 max-w-[1024px] mx-auto">
      <span className="font-[unbounded] font-bold text-3xl md:w-[75%] text-center md:text-[40px] md:leading-tight">
        From admin overload <br /> to{' '}
        <span className="text-[#96A546]">seamless lunch operations</span>
      </span>

      <div className="grid md:grid-cols-2 gap-5 md:gap-20 w-full md:px-0 mt-5">
        {/* Problems */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold w-full text-left text-lg">
            Are you facing these challenges?
          </h3>
          {problemList.map((problem, index) => (
            <div
              key={index}
              className="flex items-start gap-3 border border-[#D7D7D7] rounded-2xl p-4">
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
            How PITO solves it
          </h3>
          {solutionList.map((solution, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-[#C5D475] rounded-2xl p-4">
              <div className="size-9 text-xl shrink-0 rounded-full flex items-center justify-center bg-white">
                {solution.icon}
              </div>
              <span className="text-black">{solution.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommonProblems;
