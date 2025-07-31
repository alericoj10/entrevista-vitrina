"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GoPayButtonProps {
  productId: string;
  productType: "event" | "digital_content";
  originalPrice?: number;
  discountedPrice?: number;
  discountCode?: string;
  isCapacityReached?: boolean;
}

export default function GoPayButton({ 
  productId, 
  productType,
  originalPrice,
  discountedPrice,
  discountCode,
  isCapacityReached = false
}: GoPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsLoading(true);
    
    const params = new URLSearchParams({
      productId,
      productType,
    });
    
    if (originalPrice !== undefined) params.append('originalPrice', originalPrice.toString());
    if (discountedPrice !== undefined) params.append('discountedPrice', discountedPrice.toString());
    if (discountCode) params.append('discountCode', discountCode);
    
    setTimeout(() => {
      router.push(`/payment?${params.toString()}`);
    }, 500); // Short delay for better UX
  };

  const isDisabled = isLoading || (productType === "event" && isCapacityReached);

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Procesando...
        </>
      ) : isCapacityReached ? (
        <>
          <svg 
            className="-ml-1 mr-2 h-4 w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Evento sin cupos
        </>
      ) : (
        <>
          <svg 
            className="-ml-1 mr-2 h-4 w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            ></path>
          </svg>
          Ir a pagar
        </>
      )}
    </button>
  );
}
