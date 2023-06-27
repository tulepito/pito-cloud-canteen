import { Menu, MenuItem } from '@components/Menu/Menu';

type TTooltipMenuProps = {};

const LABEL_IDS = [
  'OrderHeaderState.TooltipMenu.editOrder',
  'OrderHeaderState.TooltipMenu.managePicking',
  'OrderHeaderState.TooltipMenu.deleteOrder',
  'OrderHeaderState.TooltipMenu.cancelOrder',
];

const TooltipMenu: React.FC<TTooltipMenuProps> = () => {
  return (
    <Menu>
      {LABEL_IDS.map((id) => (
        <MenuItem key={id} labelId={id} />
      ))}
    </Menu>
  );
};

export default TooltipMenu;
