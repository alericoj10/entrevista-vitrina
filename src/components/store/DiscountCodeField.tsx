"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DiscountCode } from "@/types/database";

interface DiscountCodeFieldProps {
  productId: string;
  price: number;
  onDiscountApplied: (discountedPrice: number, discount: DiscountCode) => void;
  onDiscountRemoved: () => void;
}

export default function DiscountCodeField({
  price,
  onDiscountApplied,
  onDiscountRemoved,
}: DiscountCodeFieldProps) {
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const applyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError("Ingresa un código de descuento");
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      // Fetch the discount code from the database
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", code.trim())
        .single();

      if (error) {
        setError("Código de descuento inválido");
        setIsApplying(false);
        return;
      }

      // Store the applied discount
      setAppliedDiscount(data);
      
      // Calculate the discounted price
      const discountAmount = price * (data.discount_percentage / 100);
      const discountedPrice = price - discountAmount;
      
      // Callback to parent with the new price
      onDiscountApplied(discountedPrice, data);
      
      setIsApplying(false);
    } catch (err) {
      console.error("Error applying discount code:", err);
      setError("Error al aplicar el código de descuento");
      setIsApplying(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setCode("");
    onDiscountRemoved();
  };

  return (
    <div className="mt-4">
      <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700 mb-1">
        Código de descuento
      </label>
      
      {!appliedDiscount ? (
        <form onSubmit={applyDiscount} className="flex space-x-2">
          <div className="flex-grow">
            <input
              type="text"
              id="discount-code"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa tu código"
              disabled={isApplying}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isApplying}
          >
            {isApplying ? "Aplicando..." : "Aplicar"}
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-green-800">
                Código aplicado: <span className="font-bold">{appliedDiscount.code}</span>
              </p>
              <p className="text-xs text-green-700">
                {appliedDiscount.discount_percentage}% de descuento
              </p>
            </div>
            <button
              type="button"
              onClick={removeDiscount}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
