"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { DiscountCode } from "@/types/database";
import { format } from "date-fns";

const discountCodeSchema = z.object({
  code: z.string().min(3, "El código debe tener al menos 3 caracteres"),
  discount_percentage: z.coerce
    .number()
    .min(1, "El descuento debe ser al menos 1%")
    .max(100, "El descuento no puede ser mayor a 100%"),
});

type DiscountCodeFormValues = z.infer<typeof discountCodeSchema>;

export default function DiscountCodesList() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiscountCodeFormValues>({
    resolver: zodResolver(discountCodeSchema),
    defaultValues: {
      code: "",
      discount_percentage: 10,
    },
  });

  const fetchDiscountCodes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDiscountCodes(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar los códigos de descuento. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DiscountCodeFormValues) => {
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      const { data: existingCode, error: checkError } = await supabase
        .from("discount_codes")
        .select("code")
        .eq("code", data.code.toUpperCase())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingCode) {
        setError("Este código de descuento ya existe.");
        setIsSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("discount_codes")
        .insert({
          code: data.code.toUpperCase(),
          discount_percentage: data.discount_percentage,
          active: true,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      reset();
      fetchDiscountCodes();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el código de descuento. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDiscountCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("discount_codes")
        .update({ active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      fetchDiscountCodes();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar el código de descuento. Por favor, intenta de nuevo.";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []); // Add empty dependency array to run only once on mount

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Crear Código de Descuento</h2>

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-md">
            ¡Código de descuento creado exitosamente!
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Código *
              </label>
              <input
                type="text"
                id="code"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register("code")}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700">
                Porcentaje de descuento *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="discount_percentage"
                  min="1"
                  max="100"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-12"
                  {...register("discount_percentage")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
              {errors.discount_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.discount_percentage.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creando..." : "Crear Código"}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Códigos de Descuento</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : discountCodes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay códigos de descuento creados aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de creación
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discountCodes.map((code) => (
                  <tr key={code.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {code.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.discount_percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          code.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {code.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(code.created_at), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleDiscountCodeStatus(code.id, code.active)}
                        className={`${
                          code.active
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {code.active ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
