import { useIntl } from 'react-intl';

import QuizModal from '../components/QuizModal/QuizModal';
import MealDateForm from './MealDateForm/MealDateForm';

const QuizMealDate = () => {
  const intl = useIntl();

  return (
    <QuizModal
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({ id: 'QuizMealDate.title' })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={() => {}}
      onSubmit={() => {}}
      submitDisabled={false}
      onBack={() => {}}>
      <MealDateForm onSubmit={() => {}} />
    </QuizModal>
  );
};

export default QuizMealDate;
