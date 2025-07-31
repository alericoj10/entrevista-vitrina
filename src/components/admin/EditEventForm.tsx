"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Event, Product } from "@/types/database";

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

export default function EditEventForm({
  event,
  product,
  onSuccess,
}: {
  event: Event;
  product: Product;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    // @ts-expect-error zodResolver type error
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: product.title,
      description: product.description || "",
      price: product.price,
      event_date: event.event_date.slice(0, 16), // for datetime-local input
      duration_minutes: event.duration_minutes,
      capacity: event.capacity || undefined,
      location: event.location || "",
      meeting_url: event.meeting_url || "",
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: productError } = await supabase
        .from("products")
        .update({
          title: data.title,
          description: data.description || null,
          price: data.price,
        })
        .eq("id", product.id);

      if (productError) throw productError;

      const { error: eventError } = await supabase
        .from("events")
        .update({
          event_date: data.event_date,
          duration_minutes: data.duration_minutes,
          capacity: data.capacity || null,
          location: data.location || null,
          meeting_url: data.meeting_url || null,
        })
        .eq("id", event.id);

      if (eventError) throw eventError;

      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el evento."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // @ts-expect-error onSubmit type error
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-800 rounded">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
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
          <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
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
          Ubicación (si es presencial)
        </label>
        <input
          type="text"
          id="location"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          {...register("location")}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="meeting_url"
          className="block text-sm font-medium text-gray-700"
        >
          URL de reunión (si es online)
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
