import Link from "next/link";
import { format } from "date-fns";
import { Product, DigitalContent } from "@/types/database";

interface DigitalContentWithDetails extends Product {
  digitalContent: DigitalContent | null;
}

interface DigitalContentCardProps {
  content: DigitalContentWithDetails;
}

export default function DigitalContentCard({ content }: DigitalContentCardProps) {
  if (!content.digitalContent) return null;

  const digitalDetails = content.digitalContent;
  const fileExtension = digitalDetails.file_name.split('.').pop()?.toLowerCase() || '';
  
  // Determine file type icon and display name
  let fileTypeIcon = "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
  let fileTypeName = "Archivo";
  
  if (['pdf'].includes(fileExtension)) {
    fileTypeName = "PDF";
    fileTypeIcon = "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
  } else if (['doc', 'docx'].includes(fileExtension)) {
    fileTypeName = "Documento";
    fileTypeIcon = "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
  } else if (['xls', 'xlsx'].includes(fileExtension)) {
    fileTypeName = "Hoja de cálculo";
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

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
      {/* File type badge */}
      <div className="p-5 pb-2 flex items-start justify-between">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {fileTypeName}
        </span>
        
        <span className="text-sm text-gray-500">
          {format(new Date(content.created_at), "dd/MM/yyyy")}
        </span>
      </div>
      
      {/* Card content */}
      <div className="px-5 pt-2 pb-5 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{content.title}</h3>
        
        <div className="mb-3 flex-grow">
          <p className="text-sm text-gray-600 line-clamp-3">
            {content.description || "Sin descripción disponible"}
          </p>
        </div>
        
        <div className="mt-2 space-y-2 text-sm text-gray-500">
          {/* File name */}
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1.5 text-gray-400"
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
            <span className="truncate">{digitalDetails.file_name}</span>
          </div>
        </div>
        
        {/* Price and action */}
        <div className="mt-4 flex items-center justify-between">
          <div className="font-semibold">
            {content.price === 0
              ? "Gratis"
              : new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(content.price)}
          </div>
          
          <Link
            href={`/store/digital/${content.id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
}
