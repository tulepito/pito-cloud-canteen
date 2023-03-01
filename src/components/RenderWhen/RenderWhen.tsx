import * as React from 'react';

type TWhenProps = React.PropsWithChildren<{
  condition?: boolean;
}>;

const RenderWhen = ({ condition = true, children }: TWhenProps) => {
  const list: React.ReactNode[] = [];

  React.Children.forEach(children, (child: any) => {
    if (
      (condition && child.props.type === 'true') ||
      (!condition && child.props.type === 'false')
    ) {
      list.push(child);
    }
  });

  return <>{list}</>;
};

const RenderWhenTrue = ({ children }: React.PropsWithChildren) => (
  <>{children}</>
);
RenderWhenTrue.defaultProps = {
  type: 'true',
};
RenderWhen.True = RenderWhenTrue;

const RenderWhenFalse = ({ children }: React.PropsWithChildren) => (
  <>{children}</>
);
RenderWhenFalse.defaultProps = {
  type: 'false',
};
RenderWhen.False = RenderWhenFalse;

export default RenderWhen;
