"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product, Event, DigitalContent, ProductWithDetails } from "@/types/database";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EditProductModal from "./EditProductModal";
import ProductPurchasesList from "./ProductPurchasesList";

export default function ProductsList() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);
  const [viewingPurchases, setViewingPurchases] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*");

      if (eventsError) throw eventsError;

      const { data: digitalData, error: digitalError } = await supabase
        .from("digital_contents")
        .select("*");

      if (digitalError) throw digitalError;

      const productsWithDetails = productsData.map((product: Product) => {
        const event = eventsData.find((e: Event) => e.product_id === product.id);
        const digitalContent = digitalData.find((d: DigitalContent) => d.product_id === product.id);
        
        return {
          ...product,
          event,
          digitalContent
        };
      });

      setProducts(productsWithDetails);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar los productos. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchProducts();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar el producto. Por favor, intenta de nuevo.";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
          onClick={fetchProducts}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No tienes productos creados aún.</p>
        <p className="text-gray-500">
          Utiliza las pestañas &quot;Crear Evento&quot; o &quot;Crear Material Digital&quot; para agregar nuevos productos.
        </p>
      </div>
    );
  }

  return (
    <div>
      {viewingPurchases ? (
        <ProductPurchasesList
          productId={viewingPurchases}
          onBack={() => setViewingPurchases(null)}
        />
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Mis Productos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Título
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Precio
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Detalles
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha de creación
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.type === "event"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.type === "event"
                          ? "Evento"
                          : "Material Digital"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price === 0
                          ? "Gratis"
                          : new Intl.NumberFormat("es-CL", {
                              style: "currency",
                              currency: "CLP",
                            }).format(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.type === "event" && product.event && (
                        <div className="text-sm text-gray-500">
                          <p>
                            Fecha:{" "}
                            {format(new Date(product.event.event_date), "PPP", {
                              locale: es,
                            })}
                          </p>
                          <p>
                            Duración: {product.event.duration_minutes} minutos
                          </p>
                          <p>
                            Capacidad: {product.event.capacity || "Sin límite"}
                          </p>
                          <p>
                            {product.event.location
                              ? `Lugar: ${product.event.location}`
                              : `Online: ${product.event.meeting_url}`}
                          </p>
                        </div>
                      )}
                      {product.type === "digital_content" &&
                        product.digitalContent && (
                          <div className="text-sm text-gray-500">
                            <p>Archivo: {product.digitalContent.file_name}</p>
                            {product.digitalContent.file_url && (
                              <a
                                href={product.digitalContent.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Ver archivo
                              </a>
                            )}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(product.created_at), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 inline-flex items-center justify-center mr-2"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewingPurchases(product.id)}
                        className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 inline-flex items-center justify-center mr-2"
                        title={product.type === "event" ? "Ver Inscritos" : "Ver Clientes"}
                        aria-label={product.type === "event" ? "Ver Inscritos" : "Ver Clientes"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 inline-flex items-center justify-center"
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={() => {
            setEditingProduct(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
