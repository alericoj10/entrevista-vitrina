"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { DigitalContent, Product } from "@/types/database";

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

export default function EditDigitalContentForm({
  digitalContent,
  product,
  onSuccess,
}: {
  digitalContent: DigitalContent;
  product: Product;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileChanged, setFileChanged] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DigitalContentFormValues>({
    resolver: zodResolver(digitalContentSchema),
    defaultValues: {
      title: product.title,
      description: product.description || "",
      price: product.price.toString(),
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileChanged(true);
    }
  };

  const onSubmit = async (data: DigitalContentFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    if (fileChanged && !file) {
      setError("Debes seleccionar un archivo");
      setIsSubmitting(false);
      return;
    }

    try {
      // Update product info
      const { error: productError } = await supabase
        .from("products")
        .update({
          title: data.title,
          description: data.description || null,
          price: data.price,
        })
        .eq("id", product.id);

      if (productError) throw productError;

      // If file was changed, upload new file and update digital_contents table
      if (fileChanged && file) {
        setUploadProgress(0);
        
        // Delete old file if it exists
        if (digitalContent.file_url) {
          const oldFilePath = digitalContent.file_url.split('/').pop();
          if (oldFilePath) {
            await supabase.storage
              .from('digital-content')
              .remove([oldFilePath]);
          }
        }

        // Upload new file
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Create a simulated upload progress
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

        // Get the public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('digital-content')
          .getPublicUrl(filePath);

        // Update the digital content record
        const { error: contentError } = await supabase
          .from("digital_contents")
          .update({
            file_name: file.name,
            file_url: publicUrl,
          })
          .eq("id", digitalContent.id);

        if (contentError) throw contentError;
      }

      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el material."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-800 rounded">{error}</div>
      )}

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
            Reemplazar archivo (opcional)
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
          {file ? (
            <p className="mt-2 text-sm text-gray-500">
              Nuevo archivo: {file.name} (
              {(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Archivo actual: {digitalContent.file_name}
            </p>
          )}
        </div>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-sm text-gray-500 mt-1">
            Subiendo archivo: {uploadProgress}%
          </p>
        </div>
      )}

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
