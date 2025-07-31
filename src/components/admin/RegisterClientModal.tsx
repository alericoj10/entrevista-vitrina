"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types/database";

interface RegisterClientModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const clientSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
  sendEmail: z.boolean().default(false),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function RegisterClientModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: RegisterClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capacityInfo, setCapacityInfo] = useState<{total: number | null, remaining: number | null}>({ 
    total: null, 
    remaining: null 
  });
  const [isCheckingCapacity, setIsCheckingCapacity] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      sendEmail: false,
    },
  });

  // Check capacity for events when modal opens
  useEffect(() => {
    const checkEventCapacity = async () => {
      if (isOpen && product && product.type === "event") {
        setIsCheckingCapacity(true);
        
        try {
          // Get event details to get capacity
          const { data: eventData, error: eventError } = await supabase
            .from("events")
            .select("capacity")
            .eq("product_id", product.id)
            .single();
          
          if (eventError) throw eventError;
          
          if (eventData && eventData.capacity) {
            // Count existing purchases
            const { count, error: countError } = await supabase
              .from("purchases")
              .select("*", { count: "exact", head: true })
              .eq("product_id", product.id);
            
            if (countError) throw countError;
            
            const remainingCapacity = eventData.capacity - (count || 0);
            setCapacityInfo({
              total: eventData.capacity,
              remaining: Math.max(0, remainingCapacity)
            });
          }
        } catch (err) {
          console.error("Error checking capacity:", err);
          setError("Error al verificar la disponibilidad. Intente nuevamente.");
        } finally {
          setIsCheckingCapacity(false);
        }
      }
    };
    
    checkEventCapacity();
  }, [isOpen, product, supabase]);

  if (!isOpen || !product) return null;

  const onSubmit = async (data: ClientFormValues) => {
    // For events, check capacity again before submission
    if (product.type === "event" && capacityInfo.remaining !== null && capacityInfo.remaining <= 0) {
      setError("Este evento está completo. No se pueden registrar más participantes.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setPaymentLink(null);

    try {
      // Create a pending purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          product_id: product.id,
          customer_name: data.name,
          customer_email: data.email,
          original_price: product.price,
          final_price: product.price,
          payment_status: "pending",
          payment_method: "cash",
          customer_phone: data.phone || null,
          customer_address: data.address || null,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Generate payment link
      // This creates a URL to the payment page with the purchase ID
      const baseUrl = window.location.origin;
      const generatedLink = `${baseUrl}/payment?productId=${product.id}&productType=${product.type}&originalPrice=${product.price}&purchaseId=${purchase.id}`;
      
      setPaymentLink(generatedLink);

      // If user opted to send email
      if (data.sendEmail) {
        // Here you would integrate with an email service
        // For now we'll just show a message
        console.log(`Email would be sent to ${data.email} with link ${generatedLink}`);
      }

      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar cliente. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setPaymentLink(null);
      setError(null);
      onClose();
    }
  };

  const copyToClipboard = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      alert("Enlace copiado al portapapeles");
    }
  };
  
  // Show capacity warning for events
  const showCapacityWarning = product.type === "event" && 
    capacityInfo.remaining !== null && 
    capacityInfo.remaining <= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {product.type === "event"
              ? "Inscribir nuevo participante"
              : "Registrar nuevo cliente"}
          </h3>
        </div>

        {isCheckingCapacity ? (
          <div className="px-6 py-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-sm text-gray-600">
              Verificando disponibilidad...
            </p>
          </div>
        ) : showCapacityWarning ? (
          <div className="px-6 py-4">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Capacidad del evento alcanzada
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Este evento ha alcanzado su capacidad máxima de{" "}
                      {capacityInfo.total} participantes.
                    </p>
                    <p className="mt-1">No se pueden registrar más personas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : !paymentLink ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-4"
          >
            {product.type === "event" && capacityInfo.remaining !== null && (
              <div className="mb-4 bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Quedan {capacityInfo.remaining} cupos disponibles de{" "}
                  {capacityInfo.total}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name")}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono (opcional)
                </label>
                <input
                  type="text"
                  id="phone"
                  {...register("phone")}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Dirección (opcional)
                </label>
                <input
                  type="text"
                  id="address"
                  {...register("address")}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="sendEmail"
                  type="checkbox"
                  {...register("sendEmail")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="sendEmail"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enviar enlace de pago por correo electrónico
                </label>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? "Procesando..." : "Registrar"}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-4">
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Registro exitoso. Enlace de pago generado.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Enlace de pago
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  value={paymentLink}
                  className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                >
                  Copiar
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Comparte este enlace con el cliente para que pueda completar su
                pago.
                {product.type === "event" &&
                  " El enlace estará disponible hasta la fecha del evento."}
              </p>
            </div>

            <div className="mt-5 sm:mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
