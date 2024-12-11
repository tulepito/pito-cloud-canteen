import type { PropsWithChildren } from 'react';
import React from 'react';
import Image from 'next/image';

import authDecorBlue from '@src/assets/authDecorBlue.png';
import authDecorGreen from '@src/assets/authDecorGreen.png';
import authDecorPink from '@src/assets/authDecorPink.png';
import authDecorYellow from '@src/assets/authDecorYellow.png';

import css from './DecoratorLayout.module.scss';

const DecoratorLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className={css.wrapper}>
      <Image src={authDecorYellow} alt="Trang trí" className={css.yellow} />

      <Image src={authDecorPink} alt="Trang trí" className={css.pink} />
      <Image src={authDecorBlue} alt="Trang trí" className={css.blue} />
      <Image src={authDecorGreen} alt="Trang trí" className={css.green} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}>
        {children}
      </div>
    </div>
  );
};

export default DecoratorLayout;
