import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import Modal from '@components/Modal/Modal';

function UserLabelPreviewModal({
  isOpen,
  handleClose,
  previewSrcs,
  isLoading,
}: {
  isOpen: boolean;
  handleClose: () => void;
  previewSrcs: string[];
  isLoading: boolean;
}) {
  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      title="Danh sách mẫu in theo người tham gia"
      containerClassName="max-h-[80vh]"
      contentClassName="pb-8">
      {isLoading ? (
        <LoadingContainer></LoadingContainer>
      ) : (
        previewSrcs.map((image, index) => (
          <img
            key={index}
            src={image}
            className="w-full h-auto"
            alt="User Label"
          />
        ))
      )}
    </Modal>
  );
}

export default UserLabelPreviewModal;
