// components/DeleteDialog.tsx

import React from "react";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemLabel?: string; 
  multipleCount?: number;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemLabel = "item",
  multipleCount,
  title = "Confirm Deletion",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}) => {
  if (!isOpen) return null;

  const defaultMessage = multipleCount
    ? `Are you sure you want to delete ${multipleCount} selected ${itemLabel}s?`
    : `Are you sure you want to delete this ${itemLabel}?`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="bg-white rounded-lg p-6 max-w-md w-full border shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">
          {description || defaultMessage}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
