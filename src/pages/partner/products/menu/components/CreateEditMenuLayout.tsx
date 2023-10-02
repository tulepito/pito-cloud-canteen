import css from './CreateEditMenuLayout.module.scss';

type TCreateEditMenuLayoutProps = {};

const CreateEditMenuLayout: React.FC<TCreateEditMenuLayoutProps> = () => {
  return (
    <div className={css.root}>
      <div className={css.titleContainer}></div>
      <div className={css.stepContainer}></div>
    </div>
  );
};

export default CreateEditMenuLayout;
