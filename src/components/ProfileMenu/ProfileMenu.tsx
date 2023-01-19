/**
 * Menu is component that shows extra content when it is clicked.
 * Clicking it toggles visibility of MenuContent.
 *
 * Example:
 *  <Menu>
 *    <MenuLabel>
 *      <span>Open menu</span>
 *    </MenuLabel>
 *    <MenuContent>
 *      <MenuItem key="first item">
 *        <Button onClick={onClick}>Click this</Button>
 *      </MenuItem>
 *    </MenuContent>
 *  </Menu>
 *
 */

import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import type { FocusEvent, KeyboardEvent, PropsWithChildren } from 'react';
import React, { Children, cloneElement, useEffect, useRef } from 'react';

import css from './ProfileMenu.module.scss';

const KEY_CODE_ESCAPE = '27';
const CONTENT_TO_LEFT = 'left';
const CONTENT_TO_RIGHT = 'right';

const MAX_MOBILE_SCREEN_WIDTH = 768;
const CONTENT_PLACEMENT_OFFSET = 0;

const isControlledMenu = (
  isOpenProp: boolean | null,
  onToggleActiveProp: any,
) => {
  return isOpenProp !== null && onToggleActiveProp !== null;
};

type TProfileMenuProps = PropsWithChildren<{
  className?: string;
  rootClassName?: string;
  contentPosition?: string;
  contentPlacementOffset?: number;
  useArrow?: boolean;
  isOpen?: boolean;
  onToggleActive?: (e: boolean) => void;
}>;

const ProfileMenu: React.FC<TProfileMenuProps> = (props) => {
  const {
    isOpen: isOpenProps = null,
    onToggleActive = null,
    contentPlacementOffset = CONTENT_PLACEMENT_OFFSET,
    contentPosition = CONTENT_TO_RIGHT,
    useArrow = false,
  } = props;
  const { value: isOpenState, setValue: setOpen } = useBoolean();
  const { value: ready, setValue: setReady } = useBoolean();

  const isIndependentMenu = isOpenProps === null && onToggleActive === null;
  if (!(isIndependentMenu || isControlledMenu(isOpenProps, onToggleActive))) {
    throw new Error(
      `Menu has invalid props:
          Both isOpen and onToggleActive need to be defined (controlled menu),
          or neither of them (menu uses its own state management).`,
    );
  }

  const menuRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setReady(true);
  }, []);

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    // FocusEvent is fired faster than the link elements native click handler
    // gets its own event. Therefore, we need to check the origin of this FocusEvent.
    if (menuRef.current && !menuRef.current.contains(event.relatedTarget)) {
      if (isControlledMenu(isOpenProps, onToggleActive)) {
        if (onToggleActive) {
          onToggleActive(false);
        }
      } else {
        setOpen(false);
      }
    }
  };

  const toggleOpen = (enforcedState: boolean) => {
    // If state is handled outside of Menu component, we call a passed in onToggleActive func
    if (isControlledMenu(isOpenProps, onToggleActive)) {
      const isMenuOpen = enforcedState != null ? enforcedState : !isOpenProps;
      if (onToggleActive) {
        onToggleActive(isMenuOpen);
      }
    } else {
      // If state is handled inside of Menu component, set state
      setOpen((isOpen: boolean) => {
        const isMenuOpen = enforcedState != null ? enforcedState : !isOpen;
        return isMenuOpen;
      });
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // Gather all escape presses to close menu
    if (e.key === KEY_CODE_ESCAPE) {
      toggleOpen(false);
    }
  };

  const positionStyleForMenuContent = (contentPositionParam: string) => {
    if (menuRef.current && menuContentRef.current) {
      const windowWidth = window.innerWidth;
      const rect = menuRef.current.getBoundingClientRect();

      // Calculate wether we should show the menu to the left of the component or right
      const distanceToRight = windowWidth - rect.right;
      const menuWidth = menuRef.current.offsetWidth;
      const contentWidthBiggerThanLabel =
        menuContentRef.current.offsetWidth - menuWidth;
      const usePositionLeftFromLabel = contentPositionParam === CONTENT_TO_LEFT;
      if (windowWidth <= MAX_MOBILE_SCREEN_WIDTH) {
        // Take full screen width on mobile
        return {
          left: -1 * (rect.left - 24),
          width: 'calc(100vw - 48px)',
        };
      }

      // Render menu content to the left according to the contentPosition
      // prop or if the content does not fit to the right. Otherwise render to
      // the right.
      return usePositionLeftFromLabel ||
        distanceToRight < contentWidthBiggerThanLabel
        ? { right: contentPlacementOffset, minWidth: menuWidth }
        : { left: contentPlacementOffset, minWidth: menuWidth };
    }

    // When the MenuContent is rendered for the first time
    // (for the sake of width calculation),
    // move it outside of viewport to prevent possible overflow.
    return isOpenState ? {} : { left: '-10000px' };
  };

  const positionStyleForArrow = (isPositionedRight: boolean) => {
    if (menuRef.current) {
      const menuWidth = menuRef.current.offsetWidth;
      return isPositionedRight
        ? Math.floor(menuWidth / 2) - contentPlacementOffset
        : Math.floor(menuWidth / 2);
    }
    return 0;
  };

  const prepareChildren = () => {
    if (Children.count(props.children) !== 2) {
      throw new Error(
        'Menu needs to have two children: MenuLabel and MenuContent.',
      );
    }

    return Children.map(props.children, (child: any) => {
      const isOpen = isControlledMenu(isOpenProps, onToggleActive)
        ? isOpenProps
        : isOpenState;

      if (child.type === ProfileMenuLabel) {
        // MenuLabel needs toggleOpen function
        // We pass that directly  so that component user doesn't need to worry about that
        return cloneElement(child, {
          isOpen,
          onToggleActive: toggleOpen,
        });
      }
      if (child.type === ProfileMenuContent) {
        // MenuContent needs some styling data (width, arrowPosition, and isOpen info)
        // We pass those directly so that component user doesn't need to worry about those.
        const positionStyles = positionStyleForMenuContent(contentPosition);
        const arrowPosition = useArrow
          ? positionStyleForArrow(positionStyles.right != null)
          : null;

        return cloneElement(child, {
          arrowPosition,
          contentRef: (node: any) => {
            menuContentRef.current = node;
            setReady(true);
          },
          isOpen,
          style: { ...child.props.style, ...positionStyles },
        });
      }
      throw new Error(
        'Menu has an unknown child. Only MenuLabel and MenuContent are allowed.',
      );
    });
  };

  const { className, rootClassName } = props;
  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className);

  const menuChildren = ready ? prepareChildren() : null;

  return (
    <div
      className={classes}
      onBlur={onBlur}
      tabIndex={0}
      onKeyDown={onKeyDown}
      ref={menuRef}>
      {menuChildren || null}
    </div>
  );
};

export default ProfileMenu;
