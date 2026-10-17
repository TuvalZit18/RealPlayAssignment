import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { MODAL_DEFINITIONS, type ModalParamsMap, type ModalType, type OpenModalArgs } from './modalRegistry';
import { parseModals } from './parseModals';

/**
 * The task's "modal-stack provider": a thin layer over the URL. Any component
 * inside the router can call openModal / closeModal. Both push a history
 * entry, so Back undoes the last open or close. Other params are kept.
 */
export function useModalStack() {
  const [searchParams, setSearchParams] = useSearchParams();

  const modals = useMemo(() => parseModals(searchParams), [searchParams]);

  const openModal = useCallback(
    ({ type, params }: OpenModalArgs) => {
      const definition = MODAL_DEFINITIONS[type] as {
        param: string;
        serialize: (p: ModalParamsMap[ModalType]) => string;
      };
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        // `set` updates in place if present, otherwise appends (newest on top).
        next.set(definition.param, definition.serialize((params ?? {}) as ModalParamsMap[ModalType]));
        return next;
      });
    },
    [setSearchParams],
  );

  const closeModal = useCallback(
    (type: ModalType) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete(MODAL_DEFINITIONS[type].param);
        return next;
      });
    },
    [setSearchParams],
  );

  return { modals, openModal, closeModal };
}
