import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Modal = ({ isOpen, children, className = "" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className={`w-full max-w-md sm:max-w-sm ${className}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModalContent = ({ children, className = "" }) => {
  return (
    <div className={`rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export const ModalHeader = ({ children, icon, className = "" }) => {
  return (
    <div className={`mb-5 flex items-center gap-3 ${className}`}>
      {icon && (
        <motion.div 
          className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export const ModalTitle = ({ children, className = "" }) => {
  return (
    <div className={`text-lg font-semibold text-[var(--text-primary)] ${className}`}>
      {children}
    </div>
  );
};

export const ModalDescription = ({ children, className = "" }) => {
  return (
    <div className={`text-sm text-[var(--text-secondary)] truncate ${className}`}>
      {children}
    </div>
  );
};

export const ModalActions = ({ children, className = "" }) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {children}
    </div>
  );
};
