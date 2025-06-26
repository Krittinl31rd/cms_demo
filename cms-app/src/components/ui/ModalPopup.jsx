import React, { useEffect } from "react";
import { X } from "lucide-react";

const ModalPopup = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <div className="text-sm text-gray-700 space-y-3">{children}</div>
      </div>
    </div>
  );
};

export default ModalPopup;
