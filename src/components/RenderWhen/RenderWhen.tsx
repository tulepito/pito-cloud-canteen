import React from 'react';

type TWhenProps = React.PropsWithChildren<{
  condition?: boolean;
}>;

const RenderWhen = ({ condition = true, children }: TWhenProps) => {
  const list: React.ReactNode[] = [];

  React.Children.forEach(children, (child: any) => {
    const isTypeRenderWhenFalse = child?.props?.type === 'RenderWhenFalse';

    if (child?.type !== undefined) {
      if (
        (condition && !isTypeRenderWhenFalse) ||
        (!condition && isTypeRenderWhenFalse)
      ) {
        list.push(child);
      }
    }
  });

  return <>{list}</>;
};

const RenderWhenFalse = ({ children }: React.PropsWithChildren) => {
  return <>{children}</>;
};

RenderWhenFalse.defaultProps = {
  type: 'RenderWhenFalse',
};

RenderWhen.False = RenderWhenFalse;

export default RenderWhen;
