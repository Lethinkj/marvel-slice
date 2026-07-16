import { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 text-left font-semibold text-dark-navy hover:bg-gray-50 transition-colors gap-3"
      >
        <span className="text-sm sm:text-base leading-snug flex-1">{title}</span>
        <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
          {open ? <FiMinus className="w-3.5 h-3.5" /> : <FiPlus className="w-3.5 h-3.5" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 text-sm text-text-gray leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
