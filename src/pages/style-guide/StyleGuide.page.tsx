import Accordion from '@components/Accordion/Accordion';
import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldPasswordInput from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import Modal from '@components/Modal/Modal';
import Pagination from '@components/Pagination/Pagination';
import Progress from '@components/Progress/Progress';
import Tabs from '@components/Tabs/Tabs';
import Toggle from '@components/Toggle/Toggle';
import Tooltip from '@components/Tooltip/Tooltip';
import useBoolean from '@hooks/useBoolean';
import type { TIconProps } from '@utils/types';
import { required } from '@utils/validators';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';

import css from './StyleGuide.module.scss';

const tabItems = [
  {
    label: `Đơn hàng mới`,
    id: 'don-hang-moi',
    children: `Content of Tab Pane 1`,
  },
  {
    label: `Đang chờ xác nhận`,
    id: 'cho-xac-nhan',
    children: `Content of Tab Pane 2`,
  },
  {
    label: `Đã xác nhận`,
    id: 'da-xac-nhan',
    children: `Content of Tab Pane 3`,
  },
];

const IconVoucher: React.FC<TIconProps> = (props) => {
  const { rootClassName, className, ...rest } = props;
  const classes = classNames(rootClassName, className);
  return (
    <svg
      width={22}
      height={18}
      viewBox="0 0 22 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes}
      {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5996 4.171C12.1856 4.171 11.8496 3.835 11.8496 3.421V1C11.8496 0.586 12.1856 0.25 12.5996 0.25C13.0136 0.25 13.3496 0.586 13.3496 1V3.421C13.3496 3.835 13.0136 4.171 12.5996 4.171Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5996 17.2847C12.1856 17.2847 11.8496 16.9487 11.8496 16.5347V14.5117C11.8496 14.0967 12.1856 13.7617 12.5996 13.7617C13.0136 13.7617 13.3496 14.0967 13.3496 14.5117V16.5347C13.3496 16.9487 13.0136 17.2847 12.5996 17.2847Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5996 11.8249C12.1856 11.8249 11.8496 11.4889 11.8496 11.0749V6.25391C11.8496 5.83991 12.1856 5.50391 12.5996 5.50391C13.0136 5.50391 13.3496 5.83991 13.3496 6.25391V11.0749C13.3496 11.4889 13.0136 11.8249 12.5996 11.8249Z"
        fill="#262626"
      />
      <mask
        id="mask0_13062_196474"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={22}
        height={18}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0H21.5V17.4997H0V0Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_13062_196474)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.5 11.554V13.493C1.5 14.875 2.643 16 4.048 16H17.452C18.857 16 20 14.875 20 13.493V11.554C18.749 11.225 17.823 10.093 17.823 8.751C17.823 7.408 18.748 6.277 20 5.948L19.999 4.007C19.999 2.625 18.856 1.5 17.451 1.5H4.049C2.644 1.5 1.501 2.625 1.501 4.007L1.5 6.025C2.767 6.336 3.677 7.422 3.677 8.751C3.677 10.093 2.751 11.225 1.5 11.554ZM17.452 17.5H4.048C1.816 17.5 0 15.702 0 13.493V10.901C0 10.487 0.336 10.151 0.75 10.151C1.537 10.151 2.177 9.523 2.177 8.751C2.177 8.001 1.563 7.435 0.75 7.435C0.551 7.435 0.36 7.356 0.22 7.215C0.079 7.075 0 6.883 0 6.685L0.001 4.007C0.001 1.798 1.817 0 4.049 0H17.451C19.683 0 21.499 1.798 21.499 4.007L21.5 6.601C21.5 6.799 21.421 6.991 21.28 7.131C21.14 7.272 20.949 7.351 20.75 7.351C19.963 7.351 19.323 7.979 19.323 8.751C19.323 9.523 19.963 10.151 20.75 10.151C21.164 10.151 21.5 10.487 21.5 10.901V13.493C21.5 15.702 19.684 17.5 17.452 17.5Z"
          fill="#262626"
        />
      </g>
    </svg>
  );
};

const StyleGuideCard: React.FC<PropsWithChildren> = (props) => {
  return <div className={css.styleGuideCard}>{props.children}</div>;
};
const StyleGuidePage = (props: any) => {
  const modalControl = useBoolean(false);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const onShowSizeChange = (current: number, _pageSize: number) => {
    setPageSize(_pageSize);
  };
  const onSubmitHandler = (values: object) => {
    console.log('Values:', { values });
  };

  const onSingleToggle = (value: boolean) => {
    console.log('Single toggle:', value);
  };
  const onSetPageCurrent = (value: number) => setPageCurrent(value);
  return (
    <div className={css.styleGuideContainer}>
      <StyleGuideCard>
        <FinalForm
          {...props}
          onSubmit={onSubmitHandler}
          render={(fieldRenderProps) => {
            const { handleSubmit } = fieldRenderProps;
            const requiredMessage = required('Vui lòng nhập trường dữ liệu');

            return (
              <Form onSubmit={handleSubmit}>
                <p className={css.title}>Form field component</p>

                <FieldTextInput
                  id={`leftIcon`}
                  name="leftIcon"
                  validate={requiredMessage}
                  leftIcon={<IconVoucher />}
                  label="Field with left icon"
                  className={css.fieldItem}
                />
                <FieldTextInput
                  id={`rightIcon`}
                  name="rightIcon"
                  validate={requiredMessage}
                  rightIcon={<IconVoucher />}
                  label="Field with right icon"
                  className={css.fieldItem}
                />
                <FieldTextInput
                  id={`disabledField`}
                  name="disabledField"
                  validate={requiredMessage}
                  label="Field disabled"
                  className={css.fieldItem}
                  disabled
                />
                <LocationAutocompleteInputField
                  id="location"
                  name="location"
                  rootClassName={css.fieldItem}
                  label="Field location autocomplete"
                  placeholder="Enter you location"
                />
                <FieldPasswordInput
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  label="Field password"
                  className={css.fieldItem}
                />
                <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
                  <FieldCheckbox
                    id="checkbox-group-1"
                    name="favorites"
                    value="meet"
                    label="Meet"
                  />
                  <FieldCheckbox
                    id="checkbox-group-2"
                    name="favorites"
                    value="beef"
                    label="Beef"
                  />
                  <FieldCheckbox
                    id="checkbox-group-3"
                    name="favorites"
                    value="salad"
                    label="Salad"
                  />
                </div>

                <FieldSelect
                  id="select1"
                  name="select1"
                  label="Choose an option"
                  leftIcon={<IconCalendar />}
                  className={css.fieldItem}>
                  <option value="" disabled>
                    Select with icon
                  </option>
                  <option value="first">First option</option>
                  <option value="second">Second option</option>
                </FieldSelect>

                <FieldSelect
                  id="select1"
                  name="select1"
                  label="Choose an option"
                  className={css.fieldItem}>
                  <option value="" disabled>
                    Select without icon
                  </option>
                  <option value="first">First option</option>
                  <option value="second">Second option</option>
                </FieldSelect>
                <FieldTextArea
                  name="content"
                  id="content"
                  label="Field text area"
                  placeholder="Input Content"
                />

                <Button type="submit" fullWidth style={{ margin: '16px 0' }}>
                  Submit
                </Button>
                <Modal
                  isOpen={modalControl.value}
                  handleClose={modalControl.toggle}
                  title="Thêm đối tác">
                  <FieldPasswordInput
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Enter your password"
                    label="Confirm password"
                    className={css.fieldItem}
                  />
                  <FieldTextInput
                    id={`email`}
                    name="email"
                    validate={requiredMessage}
                    placeholder="hello"
                    rightIcon={<IconVoucher />}
                    label="Email"
                    className={css.fieldItem}
                  />
                  <FieldPasswordInput
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    label="Password"
                    className={css.fieldItem}
                  />
                  <FieldPasswordInput
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Enter your password"
                    label="Confirm password"
                    className={css.fieldItem}
                  />
                  <FieldPasswordInput
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Enter your password"
                    label="Confirm password"
                    className={css.fieldItem}
                  />
                  <FieldTextInput
                    id={`email`}
                    name="email"
                    validate={requiredMessage}
                    placeholder="hello"
                    rightIcon={<IconVoucher />}
                    label="Email"
                  />
                </Modal>
              </Form>
            );
          }}
        />
      </StyleGuideCard>

      <StyleGuideCard>
        <p className={css.title}>Progress bar component</p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
          <Progress percent={0} />
          <Progress percent={30} />
          <Progress percent={50} />
          <Progress percent={60} />
          <Progress percent={95} />
          <Progress percent={100} />
        </div>

        <p className={css.title}>Progress circle component</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <Progress percent={0} type="circle" />
          <Progress percent={25} type="circle" animate />
          <Progress percent={30} type="circle" />
          <Progress percent={60} type="circle" />
          <Progress percent={75} type="circle" />
          <Progress percent={90} type="circle" />
          <Progress percent={99} type="circle" />
          <Progress percent={100} type="circle" />
        </div>
      </StyleGuideCard>
      <StyleGuideCard>
        <p className={css.title}>Toggle component</p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            gap: '24px',
            marginTop: '24px',
          }}>
          <Toggle
            onClick={onSingleToggle}
            disabled
            label=" Toggle on , disabled status "
          />
          <Toggle onClick={onSingleToggle} label="Toggle on status" />
          <Toggle status="off" onClick={onSingleToggle} label="Toggle off" />
          <Toggle
            status="off"
            onClick={onSingleToggle}
            disabled
            label="Toggle off, disable status"
          />
        </div>

        <p className={css.title}>Modal component</p>
        <Button style={{ margin: '8px 0' }} onClick={modalControl.toggle}>
          Open modal
        </Button>
      </StyleGuideCard>
      <StyleGuideCard>
        <p className={css.title}>Button component</p>
        <div>Primary</div>
        <Button
          type="button"
          fullWidth
          inProgress={true}
          style={{ margin: '8px 0' }}>
          Loading button
        </Button>
        <Button type="button" fullWidth style={{ margin: '8px 0' }}>
          Submit
        </Button>
        <Button type="button" fullWidth disabled>
          Submit
        </Button>

        <div>Secondary</div>
        <Button
          variant="secondary"
          type="button"
          fullWidth
          inProgress={true}
          style={{ margin: '8px 0' }}>
          Loading button
        </Button>
        <Button
          variant="secondary"
          type="button"
          fullWidth
          style={{ margin: '8px 0' }}>
          Submit
        </Button>
        <Button variant="secondary" type="button" fullWidth disabled>
          Submit
        </Button>

        <div>CTA</div>
        <Button
          variant="cta"
          type="button"
          fullWidth
          inProgress={true}
          style={{ margin: '8px 0' }}>
          Loading button
        </Button>
        <Button
          variant="cta"
          type="button"
          fullWidth
          style={{ margin: '8px 0' }}>
          Submit
        </Button>
        <Button variant="cta" type="button" fullWidth disabled>
          CTA
        </Button>
      </StyleGuideCard>

      <StyleGuideCard>
        <p className={css.title}>Single label</p>
        <div className={css.badgeContainer}>
          <Badge label="Label" />
          <Badge label="Label" type="warning" />
          <Badge label="Đang xác nhận" type="processing" />
          <Badge label="Thành công" type="success" />
          <Badge label="Thanh toán thất bại" type="error" />
        </div>

        <p className={css.title}>Single label with dot status</p>
        <div className={css.badgeContainer}>
          <Badge label="Label" hasDotIcon />
          <Badge label="Label" type="warning" hasDotIcon />
          <Badge label="Đang xác nhận" hasDotIcon type="processing" />
          <Badge label="Thành công" hasDotIcon type="success" />
          <Badge label="Thanh toán thất bại" type="error" hasDotIcon />
        </div>
        <p className={css.title}>Single label with dot status and icon close</p>
        <div className={css.badgeContainer}>
          <Badge label="Label" hasDotIcon hasCloseIcon />
          <Badge label="Label" type="warning" hasDotIcon hasCloseIcon />
          <Badge
            label="Đang xác nhận"
            hasDotIcon
            type="processing"
            hasCloseIcon
          />
          <Badge label="Thành công" hasDotIcon type="success" hasCloseIcon />
          <Badge
            label="Thanh toán thất bại"
            type="error"
            hasDotIcon
            hasCloseIcon
          />
        </div>
      </StyleGuideCard>
      <StyleGuideCard>
        <p className={css.title}>Tabs component</p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            gap: '24px',
          }}>
          <Tabs items={tabItems} defaultActiveKey="1" />
          <Tabs items={tabItems} defaultActiveKey="2" />
          <Tabs items={tabItems} defaultActiveKey="3" />
        </div>
      </StyleGuideCard>
      <StyleGuideCard>
        <p className={css.title}>Accordion component</p>

        <Accordion title="Loại menu">
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry standard dummy text ever
            since the 1500s.
          </p>
        </Accordion>
        <Accordion title="Nhà hàng">
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry standard dummy text ever
            since the 1500s.
          </p>
        </Accordion>
        <Accordion title="Loại ẩm thực">
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry standard dummy text ever
            since the 1500s.
          </p>
        </Accordion>
      </StyleGuideCard>
      <StyleGuideCard>
        <p className={css.title}>Pagination component</p>
        <Pagination
          total={50}
          current={pageCurrent}
          onChange={onSetPageCurrent}
          showSizeChanger={true}
          pageSizeOptions={['10', '20', '50', '100']}
          pageSize={pageSize}
          onShowSizeChange={onShowSizeChange}
          style={{ marginBottom: '24px' }}
        />
        <Pagination
          total={102}
          current={pageCurrent}
          onChange={onSetPageCurrent}
          showSizeChanger={true}
          pageSizeOptions={['10', '20', '50', '100']}
          pageSize={pageSize}
          onShowSizeChange={onShowSizeChange}
          style={{ marginBottom: '24px' }}
        />
        <Pagination
          total={1234}
          current={pageCurrent}
          onChange={onSetPageCurrent}
          showPrevNextJumpers
          style={{ marginBottom: '24px' }}
        />
        <Pagination
          total={415}
          current={pageCurrent}
          onChange={onSetPageCurrent}
          showPrevNextJumpers
          disabled
        />
      </StyleGuideCard>
      <StyleGuideCard>
        <p className={css.title}>Tooltip component</p>
        <div className={css.tooltipWrapper}>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="left">
            <span className={css.tooltipContainer}>Left tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="right">
            <span className={css.tooltipContainer}>Right tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="top">
            <span className={css.tooltipContainer}>Top tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="bottom">
            <span className={css.tooltipContainer}>Bottom tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="topLeft">
            <span className={css.tooltipContainer}>Top left tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="topRight">
            <span className={css.tooltipContainer}>Top right tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="bottomLeft">
            <span className={css.tooltipContainer}>Bottom left tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="bottomRight">
            <span className={css.tooltipContainer}>Bottom right tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="rightTop">
            <span className={css.tooltipContainer}>Right top tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="rightBottom">
            <span className={css.tooltipContainer}>Right bottom tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="leftTop">
            <span className={css.tooltipContainer}>Left top tooltip</span>
          </Tooltip>
          <Tooltip
            tooltipContent={<span>This is a tooltip</span>}
            placement="leftBottom">
            <span className={css.tooltipContainer}>Left bottom tooltip</span>
          </Tooltip>
        </div>
      </StyleGuideCard>
    </div>
  );
};

export default StyleGuidePage;
