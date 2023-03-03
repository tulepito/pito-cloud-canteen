import { useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import filter from 'lodash/filter';
import { useRouter } from 'next/router';

import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { QuizThunks } from '@redux/slices/Quiz.slice';
import { quizPaths } from '@src/paths';
import { User } from '@utils/data';
import type { TCurrentUser, TUser } from '@utils/types';

import QuizModal from '../components/QuizModal/QuizModal';

import css from './QuizSelectCompany.module.scss';

type TCreateOrderFormValues = {
  company: string;
};
const QuizSelectCompany = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const companyList = useAppSelector(
    (state) => state.ManageCompaniesPage.companyRefs,
    shallowEqual,
  );
  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );

  const fetchSelectedCompanyInProgress = useAppSelector(
    (state) => state.Quiz.fetchSelectedCompanyInProgress,
  );

  const { companyList: bookerCompanyIdList = [] } = User(
    currentUser as TCurrentUser,
  ).getMetadata();

  const bookerCompanyList = useMemo(
    () =>
      filter(companyList, (o: any) =>
        bookerCompanyIdList.includes(o.id.uuid),
      ).reduce((result: any[], cur: TUser) => {
        return [
          ...result,
          {
            id: User(cur).getId(),
            name: User(cur).getPublicData()?.companyName,
          },
        ];
      }, []),
    [bookerCompanyIdList, companyList],
  );

  const handleCustomSubmit = async (values: TCreateOrderFormValues) => {
    const { meta } = await dispatch(
      QuizThunks.fetchSelectedCompany(values.company),
    );

    if (meta.requestStatus !== 'rejected') {
      router.push(quizPaths.PerpackMemberAmount);
    }
  };

  const validate = (values: TCreateOrderFormValues) => {
    const errors: Partial<TCreateOrderFormValues> = {};
    if (!values.company) {
      errors.company = 'Vui lòng chọn công ty';
    }
    return errors;
  };

  const { form, handleSubmit, hasValidationErrors } =
    useForm<TCreateOrderFormValues>({
      onSubmit: handleCustomSubmit,
      validate,
      destroyOnUnregister: true,
    });

  const company = useField('company', form);
  const companyLabel = intl.formatMessage({
    id: 'CreateOrderForm.companyLabel',
  });

  const onFormSubmitClick = () => {
    handleSubmit();
  };
  return (
    <QuizModal
      id="QuizSelectCompanyModal"
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({
        id: 'QuizSelectCompany.title',
      })}
      submitText="Tiếp tục"
      onSubmit={onFormSubmitClick}
      modalContainerClassName={css.modalContainer}
      submitInProgress={fetchSelectedCompanyInProgress}
      submitDisabled={hasValidationErrors}>
      <div className={css.container}>
        <form>
          <FieldSelectComponent
            className={css.input}
            label={companyLabel}
            input={company.input}
            meta={company.meta}
            id={`company`}
            name="company">
            <option key={'empty'} disabled value={''}>
              {intl.formatMessage({
                id: 'CreateOrderForm.company.placeholder',
              })}
            </option>
            {bookerCompanyList.map((companyItem: any) => (
              <option key={companyItem.id} value={companyItem.id}>
                {companyItem.name}
              </option>
            ))}
          </FieldSelectComponent>
        </form>
      </div>
    </QuizModal>
  );
};

export default QuizSelectCompany;
