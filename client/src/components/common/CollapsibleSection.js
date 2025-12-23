import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useI18n from 'hooks/useI18n';

const CollapsibleSection = ({ title, titleKey, children, defaultOpen = false }) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-semibold">{titleKey ? t(titleKey) : title}</span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;






