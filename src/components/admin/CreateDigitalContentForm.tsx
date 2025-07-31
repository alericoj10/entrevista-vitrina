"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const digitalContentSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "El precio es obligatorio")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "El precio no puede ser negativo",
    }),
});

type DigitalContentFormValues = z.infer<typeof digitalContentSchema>;

export default function CreateDigitalContentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DigitalContentFormValues>({
    // @ts-expect-error zodResolver type error
    resolver: zodResolver(digitalContentSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: DigitalContentFormValues) => {
    if (!file) {
      setError("Debes seleccionar un archivo");
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          type: "digital_content",
          title: data.title,
          description: data.description || null,
          price: data.price,
        })
        .select()
        .single();

      if (productError) throw productError;

      const fileExt = file.name.split('.').pop();
      const fileName = `${product.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('digital-content')
        .upload(filePath, file);

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('digital-content')
        .getPublicUrl(filePath);

      const { error: contentError } = await supabase
        .from("digital_contents")
        .insert({
          product_id: product.id,
          file_name: file.name,
          file_url: publicUrl,
        });

      if (contentError) throw contentError;

      setSuccess(true);
      reset();
      setFile(null);
      setUploadProgress(0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el contenido digital. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Crear Nuevo Material Digital
      </h2>
      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-md">
          ¡Material digital creado exitosamente!
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}
      {/* @ts-expect-error onSubmit type error */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="md:col-span-2">
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Archivo *
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                Archivo seleccionado: {file.name} (
                {(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p className="text-sm text-gray-500 mt-1">
              Subiendo archivo: {uploadProgress}%
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear Material Digital"}
          </button>
        </div>
      </form>
    </div>
  );
}
