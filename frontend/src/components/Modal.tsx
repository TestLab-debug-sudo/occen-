import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = { sm: '400px', md: '560px', lg: '720px', xl: '900px' };

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-2.5 sm:p-4 z-[9999]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#062844]/85 backdrop-blur-md"
            onClick={onClose}
          />
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative glass-card-light overflow-hidden rounded-2xl w-full flex flex-col max-h-[92dvh] sm:max-h-[88vh] shadow-2xl"
            style={{ maxWidth: sizeMap[size] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h2 className="text-base sm:text-lg font-semibold text-white truncate pr-2">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all flex-shrink-0"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-5 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
