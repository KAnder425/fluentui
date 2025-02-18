import * as React from 'react';
import { getCode, ArrowRightKey, ArrowDownKey } from '@fluentui/keyboard-key';
import { useMergedRefs, useEventCallback, shouldPreventDefaultOnKeyDown } from '@fluentui/react-utilities';
import { useFocusFinders } from '@fluentui/react-tabster';
import { useMenuContext } from '../../contexts/menuContext';
import { MenuTriggerChildProps, MenuTriggerState } from './MenuTrigger.types';

const noop = () => null;

/**
 * Adds the necessary props to the trigger element
 */
export const useTriggerElement = (state: MenuTriggerState): MenuTriggerState => {
  const triggerRef = useMenuContext(context => context.triggerRef);
  const menuPopoverRef = useMenuContext(context => context.menuPopoverRef);
  const setOpen = useMenuContext(context => context.setOpen);
  const open = useMenuContext(context => context.open);
  const triggerId = useMenuContext(context => context.triggerId);
  const openOnHover = useMenuContext(context => context.openOnHover);
  const openOnContext = useMenuContext(context => context.openOnContext);
  const isSubmenu = useMenuContext(context => context.isSubmenu);
  const { findFirstFocusable } = useFocusFinders();
  const focusFirst = React.useCallback(() => {
    const firstFocusable = findFirstFocusable(menuPopoverRef.current);
    firstFocusable?.focus();
  }, [findFirstFocusable, menuPopoverRef]);

  const openedWithKeyboardRef = React.useRef(false);

  // TODO also need to warn on React.Fragment usage
  const child = React.Children.only(state.children);

  const onContextMenu = useEventCallback((e: React.MouseEvent<HTMLElement>) => {
    if (openOnContext) {
      e.preventDefault();
      setOpen(e, { open: true, keyboard: false });
    }
    child.props?.onContextMenu?.(e);
  });

  const onClick = useEventCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!openOnContext) {
      setOpen(e, { open: !open, keyboard: openedWithKeyboardRef.current });
      openedWithKeyboardRef.current = false;
    }
    child.props?.onClick?.(e);
  });

  const onKeyDown = useEventCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (shouldPreventDefaultOnKeyDown(e)) {
      e.preventDefault();
      openedWithKeyboardRef.current = true;
      (e.target as HTMLElement)?.click();
    }

    const keyCode = getCode(e);

    if (!openOnContext && ((isSubmenu && keyCode === ArrowRightKey) || (!isSubmenu && keyCode === ArrowDownKey))) {
      setOpen(e, { open: true, keyboard: true });
    }

    // if menu is already open, can't rely on effects to focus
    if (open && keyCode === ArrowRightKey && isSubmenu) {
      focusFirst();
    }

    if (open && keyCode === ArrowDownKey && !isSubmenu) {
      focusFirst();
    }

    child.props?.onKeyDown?.(e);
  });

  const onMouseEnter = useEventCallback((e: React.MouseEvent<HTMLElement>) => {
    if (openOnHover && !openOnContext) {
      setOpen(e, { open: true, keyboard: false });
    }

    child.props?.onMouseEnter?.(e);
  });

  const onMouseLeave = useEventCallback((e: React.MouseEvent<HTMLElement>) => {
    if (openOnHover && !openOnContext) {
      setOpen(e, { open: false, keyboard: false });
    }

    child.props?.onMouseLeave?.(e);
  });

  const disabled = child.props?.disabled;
  const triggerProps: MenuTriggerChildProps = {
    'aria-haspopup': true,
    'aria-expanded': open,
    id: child.props.id || triggerId,

    ...(!disabled
      ? {
          onClick,
          onMouseEnter,
          onMouseLeave,
          onContextMenu,
          onKeyDown,
        }
      : // Spread disabled event handlers to implement contract and avoid specific disabled logic in handlers
        {
          onClick: noop,
          onMouseEnter: noop,
          onMouseLeave: noop,
          onContextMenu: noop,
          onKeyDown: noop,
        }),
  };

  state.children = React.cloneElement(child, {
    ...triggerProps,
    ref: useMergedRefs(child.props.ref, triggerRef),
  });

  return state as MenuTriggerState;
};
