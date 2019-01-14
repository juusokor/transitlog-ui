import React from "react";
import StyledModal from "styled-react-modal";
import styled from "styled-components";
import {Button} from "./Forms";

const ShareModal = StyledModal.styled`
  width: 40vw;
  min-width: 20rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lightest-grey);
  box-shadow: 0 0 20px 0 rgba(0,0,0,0.25);
  border-radius: 5px;
  border: 1px solid var(--blue);
  padding: 1.5rem;
`;

const UrlDisplay = styled.textarea`
  background: white;
  font-family: inherit;
  box-shadow: inset 2px 2px 5px 0 rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  line-height: 1.5;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const CopyButton = styled(Button)`
  margin-left: auto;
`;

function copyToClipboard(str) {
  console.log(`Copied ${str}`);
}

export default ({isOpen, onClose}) => {
  const prodOrigin = process.env.REACT_APP_PRODUCTION_URL;
  const currentOrigin = window.location.origin;

  let shareUrl = window.location.href;

  if (prodOrigin !== currentOrigin) {
    shareUrl = shareUrl.replace(currentOrigin, prodOrigin);
  }

  return (
    <ShareModal
      isOpen={isOpen}
      onBackgroundClick={onClose}
      onEscapeKeydown={onClose}>
      <ModalContent>
        <UrlDisplay resizeable={false} rows={4} value={shareUrl} disabled={true} />
        <CopyButton primary onClick={() => copyToClipboard(shareUrl)}>
          Copy
        </CopyButton>
      </ModalContent>
    </ShareModal>
  );
};
