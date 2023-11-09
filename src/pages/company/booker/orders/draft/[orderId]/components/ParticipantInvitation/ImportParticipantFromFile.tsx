import Button from '@components/Button/Button';
import IconLightBulb from '@components/Icons/IconLightBulb/IconLightBulb';
import IconUploadFile from '@components/Icons/IconUploadFile/IconUploadFile';

import css from './ImportParticipantFromFile.module.scss';

type TImportParticipantFromFileProps = {};

const ImportParticipantFromFile: React.FC<
  TImportParticipantFromFileProps
> = () => {
  return (
    <div className={css.root}>
      <div>
        <IconLightBulb />
        <div>
          <div className={css.importTipTitle}>MẸO NHỎ</div>
          <div className={css.importTipContent}>
            Bạn có thể thêm hàng loạt email bằng cách copy danh sách email và
            dán vào ô nhập email hoặc tải lên file excel. Tải file mẫu{' '}
            <strong className={css.downloadTemplateBtn}>
              <u>tại đây</u>
            </strong>
          </div>
        </div>

        <Button variant="secondary">
          <IconUploadFile />
          <span>Tải lên file</span>
        </Button>
      </div>
    </div>
  );
};

export default ImportParticipantFromFile;
