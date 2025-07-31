import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import ProductSidebar from "@/components/store/ProductSidebar";

type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Generate metadata for SEO
// export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
//   const supabase = await createClient();
//   const { data: product } = await supabase
//     .from("products")
//     .select("*")
//     .eq("id", params.id)
//     .single();

//   if (!product) {
//     return {
//       title: "Contenido digital no encontrado",
//       description: "El contenido digital que buscas no existe o ha sido eliminado.",
//     };
//   }

//   return {
//     title: `${product.title} | Encuadrado`,
//     description: product.description || "Contenido digital para profesionales en Encuadrado",
//   };
// }

export default async function DigitalContentDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  
  // Fetch the product
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product || product.type !== "digital_content") {
    notFound();
  }

  // Fetch the digital content details
  const { data: contentDetails } = await supabase
    .from("digital_contents")
    .select("*")
    .eq("product_id", product.id)
    .single();

  if (!contentDetails) {
    notFound();
  }

  // Extract file extension and determine file type
  const fileExtension = contentDetails.file_name.split('.').pop()?.toLowerCase() || '';
  
  // Determine file type display name
  let fileTypeName = "Archivo";
  let fileTypeIcon = "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
  
  if (['pdf'].includes(fileExtension)) {
    fileTypeName = "PDF";
  } else if (['doc', 'docx'].includes(fileExtension)) {
    fileTypeName = "Documento Word";
  } else if (['xls', 'xlsx'].includes(fileExtension)) {
    fileTypeName = "Hoja de cálculo Excel";
    fileTypeIcon = "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
  } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
    fileTypeName = "Imagen";
    fileTypeIcon = "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z";
  } else if (['mp4', 'avi', 'mov'].includes(fileExtension)) {
    fileTypeName = "Video";
    fileTypeIcon = "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
  } else if (['mp3', 'wav'].includes(fileExtension)) {
    fileTypeName = "Audio";
    fileTypeIcon = "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z";
  } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
    fileTypeName = "Archivo comprimido";
    fileTypeIcon = "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4";
  }

  // Format date
  const formattedDate = format(new Date(product.created_at), "dd/MM/yyyy");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link href="/store?tab=digital" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la tienda
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.title}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow sm:rounded-lg">
          {/* Content header with type badge */}
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {fileTypeName}
            </span>
            
            <span className="text-gray-500">
              Publicado el {formattedDate}
            </span>
          </div>
          
          {/* Content body */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main content - 2/3 width */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">Descripción</h2>
                <div className="mt-3 prose prose-blue max-w-none">
                  <p className="text-gray-600 whitespace-pre-line">
                    {product.description || "Sin descripción disponible."}
                  </p>
                </div>
              </div>
              
              {/* File details */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">Detalles del archivo</h2>
                <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Tipo de archivo</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-1.5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={fileTypeIcon}
                          />
                        </svg>
                        <span>{fileTypeName}</span>
                      </div>
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Nombre del archivo</dt>
                    <dd className="mt-1 text-sm text-gray-900 truncate" title={contentDetails.file_name}>
                      {contentDetails.file_name}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Sidebar - 1/3 width */}
            <div className="md:col-span-1">
              <ProductSidebar product={product} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
