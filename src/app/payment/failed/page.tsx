"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Purchase } from "@/types/database";

function PaymentFailedLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-3 text-gray-600">Cargando información...</p>
    </div>
  );
}

function PaymentFailedContent() {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");

  useEffect(() => {
    async function fetchPurchaseDetails() {
      if (!purchaseId) {
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("id", purchaseId)
        .single();

      if (error) {
        console.error("Error fetching purchase details:", error);
      } else {
        setPurchase(data);
      }
      
      setIsLoading(false);
    }
    
    fetchPurchaseDetails();
  }, [purchaseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-3 text-gray-600">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg 
                className="h-10 w-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            
            <h3 className="mt-6 text-2xl font-medium text-gray-900">Pago no procesado</h3>
            
            <p className="mt-2 text-gray-600">
              Lo sentimos, no pudimos procesar tu pago. Por favor, intenta de nuevo con otro método de pago o contacta a tu banco.
            </p>
            
            {purchase && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Información del pedido</h4>
                <div className="text-sm text-left max-w-md mx-auto">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">ID del pedido:</span>
                    <span className="font-medium">{purchase.id}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Monto:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(purchase.final_price)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 space-y-4">
              <p className="text-sm text-gray-500">
                Posibles razones del fallo:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500">
                <li>Fondos insuficientes en la cuenta</li>
                <li>Límite de la tarjeta excedido</li>
                <li>La tarjeta ha expirado</li>
                <li>Información de pago incorrecta</li>
                <li>El banco rechazó la transacción</li>
              </ul>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
              <Link 
                href="/payment"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Intentar de nuevo
              </Link>
              
              <Link 
                href="/store"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver a la tienda
              </Link>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6 border-t border-gray-200 text-sm text-center text-gray-500">
            Si continúas teniendo problemas, por favor contacta a nuestro equipo de soporte en <a href="mailto:soporte@encuadrado.com" className="text-blue-600 hover:text-blue-500">soporte@encuadrado.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PaymentFailedLoading />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
