import Button from '@components/Button/Button';
import IconLightBulb from '@components/Icons/IconLightBulb/IconLightBulb';
import IconUploadFile from '@components/Icons/IconUploadFile/IconUploadFile';
import NamedLink from '@components/NamedLink/NamedLink';

import css from './ImportParticipantFromFile.module.scss';

type TImportParticipantFromFileProps = {};

const ImportParticipantFromFile: React.FC<
  TImportParticipantFromFileProps
> = () => {
  return (
    <div className={css.root}>
      <IconLightBulb className={css.desktopLightIcon} />
      <div>
        <div className={css.importTipTitle}>
          <IconLightBulb className={css.mobileLightIcon} />
          <div>MẸO NHỎ</div>
        </div>
        <div className={css.importTipContent}>
          Bạn có thể thêm hàng loạt email bằng cách copy danh sách email và dán
          vào ô nhập email hoặc tải lên file excel. Tải file mẫu{' '}
          <strong className={css.downloadTemplateBtn}>
            <u>
              <NamedLink
                target="_blank"
                path={process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_FILE_URL}>
                tại đây
              </NamedLink>
            </u>
          </strong>
        </div>
      </div>

      <Button className={css.uploadFileButton} variant="secondary">
        <IconUploadFile />
        <span>Tải lên file</span>
      </Button>
    </div>
  );
};

export default ImportParticipantFromFile;
