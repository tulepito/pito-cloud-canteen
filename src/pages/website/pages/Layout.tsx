import React from 'react';

import Container from '../components/Container';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
// eslint-disable-next-line import/no-cycle
import Navbar from '../components/Navbar';

const ModalContext = React.createContext<{
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}>({
  isModalOpen: false,
  setIsModalOpen: () => {},
});
export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
};
export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <ModalContext.Provider value={{ isModalOpen, setIsModalOpen }}>
      {children}

      <Modal isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </ModalContext.Provider>
  );
};

const Layout = ({
  children,
  noFooter,
}: {
  children: React.ReactNode;
  noFooter?: boolean;
}) => {
  return (
    <div
      className="overflow-x-hidden"
      style={{
        fontFamily: 'Quicksand',
      }}>
      <ModalProvider>
        <Navbar />
        <Container>
          <main className="pt-[80px]">{children}</main>
        </Container>
        {!noFooter && <Footer />}
      </ModalProvider>
    </div>
  );
};

export default Layout;
