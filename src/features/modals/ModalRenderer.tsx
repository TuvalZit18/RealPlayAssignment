import type { ComponentType } from 'react';
import { InviteModal, PromoModal, SignupModal, WelcomeModal, type ModalProps } from './ModalContents';
import type { ModalType } from './modalRegistry';
import { useModalStack } from './useModalStack';

const MODAL_COMPONENTS: { [K in ModalType]: ComponentType<ModalProps<K>> } = {
  welcome: WelcomeModal,
  promo: PromoModal,
  invite: InviteModal,
  signup: SignupModal,
};

// The single global modal renderer, mounted once in AppLayout. Renders every
// open modal from the URL in order; later ones sit on top and only the bottom
// one dims the page. Signed-out gating is added in Stage 7.
export function ModalRenderer() {
  const { modals, closeModal } = useModalStack();

  return (
    <>
      {modals.map((modal, index) => {
        const Modal = MODAL_COMPONENTS[modal.type] as ComponentType<ModalProps<ModalType>>;
        return (
          <Modal
            key={modal.type}
            params={modal.params}
            onClose={() => closeModal(modal.type)}
            hideBackdrop={index > 0}
          />
        );
      })}
    </>
  );
}
