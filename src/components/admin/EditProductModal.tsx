"use client";

import { useState } from "react";
import { ProductWithDetails } from "@/types/database";
import EditEventForm from "./EditEventForm";
import EditDigitalContentForm from "./EditDigitalContentForm";

interface EditProductModalProps {
  product: ProductWithDetails;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditProductModal({
  product,
  onClose,
  onUpdated,
}: EditProductModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200); // allow modal animation to finish
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-2 p-6 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={handleClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">
          Editar {product.type === "event" ? "Evento" : "Material Digital"}
        </h2>
        {product.type === "event" && product.event && (
          <EditEventForm
            event={product.event}
            product={product}
            onSuccess={onUpdated}
          />
        )}
        {product.type === "digital_content" && product.digitalContent && (
          <EditDigitalContentForm
            digitalContent={product.digitalContent}
            product={product}
            onSuccess={onUpdated}
          />
        )}
      </div>
    </div>
  );
}
