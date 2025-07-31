"use client";

import { useState, useEffect } from "react";
import { Product, DiscountCode } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import GoPayButton from "./GoPayButton";
import DiscountCodeField from "./DiscountCodeField";

interface ProductSidebarProps {
  product: Product;
  isUpcoming?: boolean; // Only used for events
  eventCapacity?: number | null;
}

export default function ProductSidebar({ 
  product, 
  isUpcoming = true,
  eventCapacity
}: ProductSidebarProps) {
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [isCapacityReached, setIsCapacityReached] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(product.type === "event");
  const supabase = createClient();
  
  // Handler for when a discount is applied
  const handleDiscountApplied = (newPrice: number, discount: DiscountCode) => {
    setDiscountedPrice(newPrice);
    setAppliedDiscount(discount);
  };
  
  // Handler for when a discount is removed
  const handleDiscountRemoved = () => {
    setDiscountedPrice(null);
    setAppliedDiscount(null);
  };

  // Check capacity for events
  useEffect(() => {
    const checkCapacity = async () => {
      if (product.type === "event" && eventCapacity) {
        setIsLoading(true);

        try {
          // Count completed and pending purchases for this product
          const { count, error } = await supabase
            .from("purchases")
            .select("*", { count: "exact", head: true })
            .eq("product_id", product.id);
          
          if (error) throw error;
          
          // Calculate spots left
          const spots = eventCapacity - (count || 0);
          setSpotsLeft(spots > 0 ? spots : 0);
          setIsCapacityReached(spots <= 0);
        } catch (error) {
          console.error("Error checking capacity:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkCapacity();
  }, [product.id, product.type, eventCapacity, supabase]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-medium text-gray-900">Precio</h2>
        <div className="text-right">
          {discountedPrice !== null && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500 line-through">
                {product.price === 0
                  ? "Gratis"
                  : new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(product.price)}
              </span>
              <span className="text-2xl font-bold text-green-600">
                {discountedPrice === 0
                  ? "Gratis"
                  : new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(discountedPrice)}
              </span>
            </div>
          )}
          
          {discountedPrice === null && (
            <span className="text-2xl font-bold text-gray-900">
              {product.price === 0
                ? "Gratis"
                : new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(product.price)}
            </span>
          )}
        </div>
      </div>
      
      {/* Capacity information for events */}
      {product.type === "event" && eventCapacity && !isLoading && (
        <div className="mt-3 text-sm">
          {isCapacityReached ? (
            <div className="bg-red-50 text-red-800 p-2 rounded flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cupos agotados
            </div>
          ) : (
            <div className="bg-blue-50 text-blue-800 p-2 rounded flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {spotsLeft} {spotsLeft === 1 ? 'cupo disponible' : 'cupos disponibles'}
            </div>
          )}
        </div>
      )}
      
      {/* Only show discount code field if the product is not free, upcoming, and has capacity */}
      {product.price > 0 && isUpcoming && !(product.type === "event" && isCapacityReached) && (
        <DiscountCodeField
          productId={product.id}
          price={product.price}
          onDiscountApplied={handleDiscountApplied}
          onDiscountRemoved={handleDiscountRemoved}
        />
      )}
      
      <div className="mt-6">
        {isUpcoming ? (
          <GoPayButton 
            productId={product.id} 
            productType={product.type} 
            originalPrice={product.price}
            discountedPrice={discountedPrice || undefined}
            discountCode={appliedDiscount?.code}
            isCapacityReached={isCapacityReached}
          />
        ) : (
          <p className="text-center py-2 bg-gray-100 rounded text-gray-500 text-sm">
            Este evento ya ha finalizado
          </p>
        )}
      </div>
      
      <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-500">
        {product.type === "event" ? (
          <>
            <p className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Registro automático al evento
            </p>
            <p className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Acceso a material exclusivo
            </p>
          </>
        ) : (
          <>
            <p className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Descarga inmediata
            </p>
            <p className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Acceso permanente
            </p>
          </>
        )}
      </div>
    </div>
  );
}
