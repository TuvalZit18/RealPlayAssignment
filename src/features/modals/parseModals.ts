import { MODAL_DEFINITIONS, modalTypeForParam, type ModalType, type OpenModal } from './modalRegistry';

/**
 * The URL is the only source of truth for open modals. Returns them in the
 * order their params appear (last = top of the stack). Invalid values and
 * repeated params are ignored; the first occurrence of a param wins.
 */
export function parseModals(searchParams: URLSearchParams): OpenModal[] {
  const open: OpenModal[] = [];
  const seen = new Set<ModalType>();

  for (const [param, value] of searchParams) {
    const type = modalTypeForParam(param);
    if (!type || seen.has(type)) continue;
    seen.add(type);

    const params = MODAL_DEFINITIONS[type].parse(value);
    if (params) open.push({ type, params } as OpenModal);
  }

  return open;
}

/** True when the URL has at least one valid modal param. */
export function hasModalParams(searchParams: URLSearchParams): boolean {
  return parseModals(searchParams).length > 0;
}
