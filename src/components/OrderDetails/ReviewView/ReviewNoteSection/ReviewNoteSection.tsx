import React from 'react';

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

  return disabled && !orderNote ? (
    <></>
  ) : (
    <Collapsible label="Ghi chú">
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
