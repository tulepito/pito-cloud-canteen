import classNames from 'classnames';

import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './IconPlus.module.scss';

type IconOutlinePlusProps = {
  className?: string;
  shouldHideCover?: boolean;
};
const IconPlus: React.FC<IconOutlinePlusProps> = ({
  className,
  shouldHideCover = false,
}) => {
  return (
    <svg
      className={classNames(css.root, className)}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.75 15.1551C10.336 15.1551 10 14.8191 10 14.4051V7.07812C10 6.66412 10.336 6.32812 10.75 6.32812C11.164 6.32812 11.5 6.66412 11.5 7.07812V14.4051C11.5 14.8191 11.164 15.1551 10.75 15.1551"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.4165 11.4902H7.0835C6.6685 11.4902 6.3335 11.1542 6.3335 10.7402C6.3335 10.3262 6.6685 9.99023 7.0835 9.99023H14.4165C14.8305 9.99023 15.1665 10.3262 15.1665 10.7402C15.1665 11.1542 14.8305 11.4902 14.4165 11.4902"
        fill="#262626"
      />
      <RenderWhen condition={!shouldHideCover}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.064 1.5C3.292 1.5 1.5 3.397 1.5 6.335V15.165C1.5 18.103 3.292 20 6.064 20H15.436C18.209 20 20 18.103 20 15.165V6.335C20 3.397 18.209 1.5 15.436 1.5H6.064ZM15.436 21.5H6.064C2.437 21.5 0 18.954 0 15.165V6.335C0 2.546 2.437 0 6.064 0H15.436C19.063 0 21.5 2.546 21.5 6.335V15.165C21.5 18.954 19.063 21.5 15.436 21.5V21.5Z"
          fill="#262626"
        />
      </RenderWhen>
    </svg>
  );
};

export default IconPlus;
