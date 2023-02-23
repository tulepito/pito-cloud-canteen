import { useIntl } from 'react-intl';

import QuizModal from '../components/QuizModal/QuizModal';
import css from './QuizMealStyles.module.scss';

const QuizMealStyles = () => {
  const intl = useIntl();
  return (
    <QuizModal
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({ id: 'QuizMealStyles.title' })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={() => {}}
      onSubmit={() => {}}
      submitDisabled={false}
      onBack={() => {}}>
      <div className={css.formContainer}></div>
    </QuizModal>
  );
};

export default QuizMealStyles;
