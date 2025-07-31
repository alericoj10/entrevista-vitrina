"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

// Form validation schema
const paymentFormSchema = z.object({
  name: z.string().min(3, "Nombre completo debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(9, "Teléfono debe tener al menos 9 dígitos"),
  address: z.string().min(5, "Dirección debe tener al menos 5 caracteres"),
  // Card fields only required if paying with card
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVC: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// Loading fallback component
function PaymentPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Main payment page content that uses search params
function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "other" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get product info from URL params
  const productId = searchParams.get("productId") || "";
  const productType = searchParams.get("productType") || "";
  const originalPrice = parseFloat(searchParams.get("originalPrice") || "0");
  const discountedPrice = searchParams.get("discountedPrice")
    ? parseFloat(searchParams.get("discountedPrice") || "0")
    : null;
  const discountCode = searchParams.get("discountCode") || null;

  // Determine final price
  const finalPrice = discountedPrice !== null ? discountedPrice : originalPrice;

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
    },
  });

  // If product info is missing, redirect to store
  useEffect(() => {
    if (!productId || !productType) {
      router.push("/store");
    }
  }, [productId, productType, router]);

  const processPayment = async (data: PaymentFormValues) => {
    setIsProcessing(true);

    try {
      // Create a new purchase record
      const supabase = createClient();

      // Create initial purchase record with pending status
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          product_id: productId,
          customer_name: data.name,
          customer_email: data.email,
          original_price: originalPrice,
          final_price: finalPrice,
          discount_code: discountCode,
          payment_method: paymentMethod === "card" ? "card" : "bank_transfer",
          payment_status: "pending",
        })
        .select()
        .single();

      if (purchaseError) {
        console.error("Error creating purchase:", purchaseError);
        throw new Error("No se pudo registrar la compra");
      }

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Determine payment result based on the rules
      let paymentSuccessful = true;

      if (paymentMethod === "card") {
        // If last digit of the final price is 8 or 9, payment fails
        const priceString = finalPrice.toFixed(0);
        const lastDigit = parseInt(priceString[priceString.length - 1]);

        if (lastDigit === 8 || lastDigit === 9) {
          paymentSuccessful = false;
        }
      }

      // Update purchase record with final status
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          payment_status: paymentSuccessful ? "completed" : "failed",
          payment_date: paymentSuccessful ? new Date().toISOString() : null,
        })
        .eq("id", purchase.id);

      if (updateError) {
        console.error("Error updating purchase:", updateError);
      }

      // Redirect to success or failure page
      if (paymentSuccessful) {
        router.push(`/payment/success?purchaseId=${purchase.id}`);
      } else {
        router.push(`/payment/failed?purchaseId=${purchase.id}`);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      alert("Error al procesar el pago. Por favor, intenta nuevamente.");
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodSelect = (method: "card" | "other") => {
    setPaymentMethod(method);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link href="/store" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la tienda
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Completar compra</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Order summary */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Resumen de la orden
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Producto</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {productType === "event" ? "Evento" : "Material Digital"}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Precio original</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${originalPrice.toLocaleString("es-CL")}
                </dd>
              </div>
              {discountCode && (
                <>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Código de descuento</dt>
                    <dd className="mt-1 text-sm text-gray-900">{discountCode}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Precio con descuento</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ${discountedPrice?.toLocaleString("es-CL")}
                    </dd>
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Total a pagar</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  ${finalPrice.toLocaleString("es-CL")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Payment method selection */}
          <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Método de pago
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <input
                  id="payment-card"
                  name="payment-method"
                  type="radio"
                  checked={paymentMethod === "card"}
                  onChange={() => handlePaymentMethodSelect("card")}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label
                  htmlFor="payment-card"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Tarjeta de crédito o débito
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="payment-other"
                  name="payment-method"
                  type="radio"
                  checked={paymentMethod === "other"}
                  onChange={() => handlePaymentMethodSelect("other")}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label
                  htmlFor="payment-other"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Transferencia bancaria
                </label>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <form onSubmit={handleSubmit(processPayment)}>
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información de contacto
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre completo
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      {...register("name")}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Correo electrónico
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Teléfono
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="phone"
                      {...register("phone")}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Dirección
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="address"
                      {...register("address")}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card payment fields */}
              {paymentMethod === "card" && (
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="card-number"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Número de tarjeta
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        {...register("cardNumber")}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="card-expiry"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Vencimiento (MM/AA)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="card-expiry"
                        placeholder="MM/AA"
                        {...register("cardExpiry")}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="card-cvc"
                      className="block text-sm font-medium text-gray-700"
                    >
                      CVC
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="card-cvc"
                        placeholder="123"
                        {...register("cardCVC")}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "other" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    Al seleccionar transferencia bancaria, podrás completar tu
                    pago mediante una transferencia a nuestra cuenta. Recibirás
                    los detalles por correo electrónico después de completar este
                    proceso.
                  </p>
                </div>
              )}
            </div>

            {/* Form submission */}
            <div className="px-4 py-5 sm:px-6">
              <button
                type="submit"
                disabled={isProcessing || !paymentMethod}
                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isProcessing || !paymentMethod
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
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
                    Procesando pago...
                  </div>
                ) : (
                  "Pagar ahora"
                )}
              </button>

              <p className="mt-2 text-xs text-center text-gray-500">
                Al completar tu compra, aceptas nuestros términos y condiciones.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Main component that wraps the content in a Suspense boundary
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentPageLoading />}>
      <PaymentPageContent />
    </Suspense>
  );
}
