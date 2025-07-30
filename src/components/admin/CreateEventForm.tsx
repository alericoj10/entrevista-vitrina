"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const eventSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  event_date: z.string().min(1, "La fecha del evento es obligatoria"),
  duration_minutes: z.coerce.number().min(1, "La duración debe ser mayor a 0"),
  capacity: z.preprocess(
    (val) => val === "" ? undefined : Number(val),
    z.number().min(1, "La capacidad debe ser mayor a 0").optional().nullable()
  ),
  location: z.string().optional().nullable(),
  meeting_url: z.preprocess(
    (val) => val === "" ? undefined : val,
    z.string().url("Ingresa una URL válida").optional().nullable()
  ),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function CreateEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    // @ts-expect-error zodResolver type error
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      event_date: "",
      duration_minutes: 60,
      capacity: undefined,
      location: "",
      meeting_url: "",
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      // First, create the product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          type: "event",
          title: data.title,
          description: data.description || null,
          price: data.price,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Then, create the event with the product_id
      const { error: eventError } = await supabase
        .from("events")
        .insert({
          product_id: product.id,
          event_date: data.event_date,
          duration_minutes: data.duration_minutes,
          capacity: data.capacity || null,
          location: data.location === "" ? null : data.location,
          meeting_url: data.meeting_url === "" ? null : data.meeting_url,
        });

      if (eventError) throw eventError;

      setSuccess(true);
      reset();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el evento. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Crear Nuevo Evento</h2>

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-md">
          ¡Evento creado exitosamente!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <form
        // @ts-expect-error onSubmit type error
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Título *
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Precio (CLP) *
            </label>
            <input
              type="number"
              id="price"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register("price")}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event_date"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha y hora del evento *
            </label>
            <input
              type="datetime-local"
              id="event_date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register("event_date")}
            />
            {errors.event_date && (
              <p className="mt-1 text-sm text-red-600">
                {errors.event_date.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="duration_minutes"
              className="block text-sm font-medium text-gray-700"
            >
              Duración (minutos) *
            </label>
            <input
              type="number"
              id="duration_minutes"
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register("duration_minutes")}
            />
            {errors.duration_minutes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.duration_minutes.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-700"
            >
              Capacidad (opcional)
            </label>
            <input
              type="number"
              id="capacity"
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register("capacity")}
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.capacity.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register("description")}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Ubicación (opcional)
            </label>
            <input
              type="text"
              id="location"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register("location")}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="meeting_url"
              className="block text-sm font-medium text-gray-700"
            >
              URL de reunión (opcional)
            </label>
            <input
              type="url"
              id="meeting_url"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              {...register("meeting_url")}
            />
            {errors.meeting_url && (
              <p className="mt-1 text-sm text-red-600">
                {errors.meeting_url.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear Evento"}
          </button>
        </div>
      </form>
    </div>
  );
}
