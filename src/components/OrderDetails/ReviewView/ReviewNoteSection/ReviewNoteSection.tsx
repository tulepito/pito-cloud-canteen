import React from 'react';
import { useIntl } from 'react-intl';

import Collapsible from '@components/Collapsible/Collapsible';

import ReviewNoteSectionForm from './ReviewNoteSectionForm';

type TReviewNoteSection = {
  onSaveOrderNote?: (value: string) => void;
  data: {
    orderNote: string;
    disabled: boolean;
  };
};

const ReviewNoteSection: React.FC<TReviewNoteSection> = (props) => {
  const {
    onSaveOrderNote,
    data: { orderNote, disabled },
  } = props;

  const intl = useIntl();

  return disabled && !orderNote ? (
    <></>
  ) : (
    <Collapsible label={intl.formatMessage({ id: 'ghi-chu' })}>
      <ReviewNoteSectionForm
        onSubmit={() => {}}
        initialValues={{
          orderNote,
        }}
        disabled={disabled}
        onSaveOrderNote={onSaveOrderNote}
      />
    </Collapsible>
  );
};

export default ReviewNoteSection;
