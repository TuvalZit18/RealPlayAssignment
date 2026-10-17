// Which query param opens which modal, and what counts as a valid value.
// See docs/architecture/routing-and-modals.md.

type NoParams = Record<string, never>;

export interface ModalParamsMap {
  welcome: NoParams;
  promo: { code: string };
  invite: { friendId: string };
  signup: NoParams;
}

export type ModalType = keyof ModalParamsMap;

/** One open modal, as derived from the URL. */
export type OpenModal = { [K in ModalType]: { type: K; params: ModalParamsMap[K] } }[ModalType];

/** Argument to openModal: `params` only for modals that take any. */
export type OpenModalArgs = {
  [K in ModalType]: ModalParamsMap[K] extends NoParams
    ? { type: K; params?: undefined }
    : { type: K; params: ModalParamsMap[K] };
}[ModalType];

interface ModalDefinition<K extends ModalType> {
  param: string;
  /** Returns params for a valid value, or null to ignore the param. */
  parse: (value: string) => ModalParamsMap[K] | null;
  serialize: (params: ModalParamsMap[K]) => string;
}

const PROMO_CODE = /^[A-Za-z0-9_-]{1,32}$/;
const FRIEND_ID = /^[A-Za-z0-9_-]{1,64}$/;

const flag = { parse: (value: string) => (value === '1' ? {} : null), serialize: () => '1' };

export const MODAL_DEFINITIONS: { [K in ModalType]: ModalDefinition<K> } = {
  welcome: { param: 'welcome', ...flag },
  promo: {
    param: 'promo',
    parse: (value) => (PROMO_CODE.test(value) ? { code: value } : null),
    serialize: ({ code }) => code,
  },
  invite: {
    param: 'invite',
    parse: (value) => (FRIEND_ID.test(value) ? { friendId: value } : null),
    serialize: ({ friendId }) => friendId,
  },
  signup: { param: 'signup', ...flag },
};

const TYPE_BY_PARAM = new Map<string, ModalType>(
  (Object.keys(MODAL_DEFINITIONS) as ModalType[]).map((type) => [MODAL_DEFINITIONS[type].param, type]),
);

export function modalTypeForParam(param: string): ModalType | undefined {
  return TYPE_BY_PARAM.get(param);
}
