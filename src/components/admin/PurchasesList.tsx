"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Purchase, Product } from "@/types/database";
import { format } from "date-fns";

type PurchaseWithProduct = Purchase & {
  product: Product;
};

export default function PurchasesList() {
  const [purchases, setPurchases] = useState<PurchaseWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPurchases = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select(`
          *,
          product:product_id (*)
        `)
        .order("created_at", { ascending: false });

      if (purchasesError) throw purchasesError;

      setPurchases(purchasesData as PurchaseWithProduct[]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar las ventas. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []); // Add empty dependency array to run only once on mount

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchPurchases}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tienes ventas registradas aún.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Historial de Ventas</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método de pago
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{purchase.customer_name}</div>
                  <div className="text-sm text-gray-500">{purchase.customer_email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{purchase.product.title}</div>
                  <div className="text-sm text-gray-500">
                    {purchase.product.type === "event" ? "Evento" : "Material Digital"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(purchase.final_price)}
                  </div>
                  {purchase.original_price !== purchase.final_price && (
                    <div className="text-sm text-gray-500 line-through">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(purchase.original_price)}
                    </div>
                  )}
                  {purchase.discount_code && (
                    <div className="text-xs text-green-600">
                      Cupón: {purchase.discount_code}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      purchase.payment_status === "completed"
                        ? "bg-green-100 text-green-800"
                        : purchase.payment_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {purchase.payment_status === "completed"
                      ? "Pagado"
                      : purchase.payment_status === "pending"
                      ? "Pendiente"
                      : "Fallido"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {purchase.payment_method === "card"
                    ? "Tarjeta"
                    : purchase.payment_method === "bank_transfer"
                    ? "Transferencia"
                    : "Efectivo"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>
                    {format(new Date(purchase.created_at), "dd/MM/yyyy")}
                  </div>
                  {purchase.payment_date && (
                    <div className="text-xs">
                      Pagado: {format(new Date(purchase.payment_date), "dd/MM/yyyy")}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
