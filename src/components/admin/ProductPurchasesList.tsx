"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Purchase, Product } from "@/types/database";
import { format } from "date-fns";
import RegisterClientModal from "./RegisterClientModal";

type PurchaseWithProduct = Purchase & {
  product: Product;
};

interface ProductPurchasesListProps {
  productId: string;
  onBack: () => void;
}

export default function ProductPurchasesList({ productId, onBack }: ProductPurchasesListProps) {
  const [purchases, setPurchases] = useState<PurchaseWithProduct[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const supabase = createClient();

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the product info first
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Then get all purchases for this product
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select(`
          *,
          product:product_id (*)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (purchasesError) throw purchasesError;

      setPurchases(purchasesData as PurchaseWithProduct[]);
      
      // Calculate totals for completed purchases
      if (purchasesData && purchasesData.length > 0) {
        const completedPurchases = purchasesData.filter(p => p.payment_status === "completed");
        const total = completedPurchases.reduce((sum, purchase) => sum + purchase.final_price, 0);
        setTotalRevenue(total);
        setTotalSales(completedPurchases.length);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar las ventas. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [productId, supabase]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases, productId]);

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
        <button
          onClick={onBack}
          className="mt-2 ml-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        >
          Volver
        </button>
      </div>
    );
  }

  // Separate pending from completed purchases
  const completedPurchases = purchases.filter(p => p.payment_status === "completed");
  const pendingPurchases = purchases.filter(p => p.payment_status === "pending");

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a la lista de productos
          </button>
          <h2 className="text-xl font-semibold">
            {product?.type === "event" ? "Inscritos en:" : "Clientes de:"} <span className="text-blue-600">{product?.title}</span>
          </h2>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          {completedPurchases.length > 0 && (
            <>
              <div className="bg-blue-50 px-4 py-2 rounded-md">
                <span className="text-sm text-blue-600 font-medium">
                  {product?.type === "event" ? "Inscritos:" : "Clientes:"} {totalSales}
                </span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-md">
                <span className="text-sm text-green-600 font-medium">
                  Ingresos: {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(totalRevenue)}
                </span>
              </div>
            </>
          )}
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {product?.type === "event" ? "Inscribir Participante" : "Registrar Cliente"}
          </button>
        </div>
      </div>

      {/* Pending Purchases Section */}
      {pendingPurchases.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pendientes de Pago</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-yellow-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enlace de Pago
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPurchases.map((purchase) => {
                  // Generate payment link for each pending purchase
                  const paymentLink = `${window.location.origin}/payment?productId=${purchase.product_id}&productType=${product?.type}&originalPrice=${purchase.original_price}&purchaseId=${purchase.id}`;
                  
                  return (
                    <tr key={purchase.id} className="bg-yellow-50 bg-opacity-30">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{purchase.customer_name}</div>
                        <div className="text-sm text-gray-500">{purchase.customer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Intl.NumberFormat("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          }).format(purchase.final_price)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(paymentLink);
                            alert("Enlace copiado al portapapeles");
                          }}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar Enlace
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(purchase.created_at), "dd/MM/yyyy")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Purchases Section */}
      {completedPurchases.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No hay {product?.type === "event" ? "inscritos" : "ventas"} registradas para este producto.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {product?.type === "event" ? "Participantes Inscritos" : "Clientes Registrados"}
          </h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Original
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Final
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descuento
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
              {completedPurchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{purchase.customer_name}</div>
                    <div className="text-sm text-gray-500">{purchase.customer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(purchase.original_price)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(purchase.final_price)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {purchase.discount_code ? (
                      <div className="flex flex-col">
                        <span className="text-sm text-green-600 font-medium">{purchase.discount_code}</span>
                        <span className="text-xs text-gray-500">
                          Ahorro: {new Intl.NumberFormat("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          }).format(purchase.original_price - purchase.final_price)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({Math.round((1 - purchase.final_price / purchase.original_price) * 100)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
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
      )}

      {/* Register Client Modal */}
      <RegisterClientModal
        product={product}
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          setShowRegisterModal(false);
          fetchPurchases();
        }}
      />
    </div>
  );
}
