"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Purchase, Product } from "@/types/database";

// Extended interface for digital content with download URL
interface DigitalContent {
  id: string;
  product_id: string;
  file_url: string;
  file_name: string;
}

// Extended interface for product with its relationships
interface ExtendedPurchase extends Purchase {
  product: Product & {
    digital_contents?: DigitalContent[];
  };
}

// Loading fallback component
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-3 text-gray-600">Cargando detalles de la compra...</p>
    </div>
  );
}

// Main content component that uses useSearchParams
function PaymentSuccessContent() {
  const [purchase, setPurchase] = useState<ExtendedPurchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");

  useEffect(() => {
    async function fetchPurchaseDetails() {
      if (!purchaseId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          product:product_id (
            *,
            digital_contents (*)
          )
        `)
        .eq("id", purchaseId)
        .single();

      if (error) {
        console.error("Error fetching purchase details:", error);
      } else {
        setPurchase(data as ExtendedPurchase);
      }
      
      setIsLoading(false);
    }
    
    fetchPurchaseDetails();
  }, [purchaseId]);

  // Function to handle file download for digital content
  const handleDownload = async () => {
    if (!purchase?.product?.digital_contents?.[0]?.file_url) {
      setDownloadError("No se encontró el archivo para descargar.");
      return;
    }
    
    setDownloadInProgress(true);
    setDownloadError(null);

    try {
      const supabase = createClient();
      const fileUrl = purchase.product.digital_contents[0].file_url;
      const fileName = purchase.product.digital_contents[0].file_name || 'download';
      
      // Extract file path from the public URL
      // The fileUrl looks like: https://xxx.supabase.co/storage/v1/object/public/digital-content/filename
      // We need to extract just the filename part
      const filePath = fileUrl.split('/').pop() || '';
      
      console.log("Attempting to download file:", filePath, "from bucket: digital-content");
      
      const { data, error } = await supabase
        .storage
        .from('digital-content')
        .download(filePath);

      if (error) {
        console.error("Download error:", error);
        throw error;
      }

      // Create download link and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("Download successful");
    } catch (err) {
      console.error("Error downloading file:", err);
      setDownloadError("Error al descargar el archivo. Por favor, intenta nuevamente o contáctanos para asistencia.");
    } finally {
      setDownloadInProgress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-3 text-gray-600">Cargando detalles de la compra...</p>
      </div>
    );
  }

  const isDigitalContent = purchase?.product?.type === "digital_content";
  const isEvent = purchase?.product?.type === "event";
  const hasDigitalContent = isDigitalContent && purchase?.product?.digital_contents && purchase.product.digital_contents.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>

            <h3 className="mt-6 text-2xl font-medium text-gray-900">
              ¡Pago completado con éxito!
            </h3>

            <p className="mt-2 text-gray-600">
              Gracias por tu compra. Hemos enviado un correo electrónico con los
              detalles de tu pedido.
            </p>

            {purchase && (
              <div className="mt-8 space-y-4 text-left border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 text-center mb-4">
                  Detalles de tu compra
                </h4>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p className="text-gray-500">Producto:</p>
                  <p className="font-medium text-right">
                    {purchase.product?.title}
                  </p>

                  <p className="text-gray-500">Número de pedido:</p>
                  <p className="font-medium text-right">{purchase.id}</p>

                  <p className="text-gray-500">Cliente:</p>
                  <p className="font-medium text-right">
                    {purchase.customer_name}
                  </p>

                  <p className="text-gray-500">Correo:</p>
                  <p className="font-medium text-right">
                    {purchase.customer_email}
                  </p>

                  <p className="text-gray-500">Precio original:</p>
                  <p className="font-medium text-right">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(purchase.original_price)}
                  </p>

                  {purchase.discount_code && (
                    <>
                      <p className="text-gray-500">Código de descuento:</p>
                      <p className="font-medium text-right text-green-600">
                        {purchase.discount_code}
                      </p>
                    </>
                  )}

                  <p className="text-gray-500 font-medium">Total pagado:</p>
                  <p className="font-bold text-right text-green-600">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(purchase.final_price)}
                  </p>

                  <p className="text-gray-500">Método de pago:</p>
                  <p className="font-medium text-right">
                    {purchase.payment_method === "card"
                      ? "Tarjeta de crédito/débito"
                      : purchase.payment_method === "bank_transfer"
                      ? "Transferencia bancaria"
                      : "Efectivo"}
                  </p>

                  <p className="text-gray-500">Fecha:</p>
                  <p className="font-medium text-right">
                    {purchase.payment_date
                      ? new Date(purchase.payment_date).toLocaleDateString(
                          "es-CL"
                        )
                      : new Date(purchase.created_at).toLocaleDateString(
                          "es-CL"
                        )}
                  </p>
                </div>

                {/* Digital Content Download Section */}
                {hasDigitalContent && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-blue-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-blue-800">
                            Tu material digital está listo
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Descarga tu contenido digital haciendo clic en el
                              botón a continuación.
                            </p>
                            <p className="font-semibold mt-1">
                              {purchase.product.digital_contents &&
                                purchase.product.digital_contents[0] &&
                                purchase.product.digital_contents[0].file_name}
                            </p>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={handleDownload}
                              disabled={downloadInProgress}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              {downloadInProgress ? (
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
                                  Descargando...
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="-ml-1 mr-2 h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                  Descargar Archivo
                                </>
                              )}
                            </button>
                          </div>
                          {downloadError && (
                            <p className="mt-2 text-sm text-red-600">
                              {downloadError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Information Section */}
                {isEvent && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-blue-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Inscripción confirmada
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Tu inscripción al evento ha sido confirmada.
                              Revisa tu correo electrónico para más detalles
                              sobre la fecha y ubicación.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <Link
                href="/store"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver a la tienda
              </Link>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6 border-t border-gray-200 text-sm text-center text-gray-500">
            Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos
            a{" "}
            <a
              href="mailto:soporte@encuadrado.com"
              className="text-blue-600 hover:text-blue-500"
            >
              soporte@encuadrado.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the content in a Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
