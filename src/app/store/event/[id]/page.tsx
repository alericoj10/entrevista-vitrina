import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import ProductSidebar from "@/components/store/ProductSidebar";

export default async function EventDetailPage(props: unknown) {
  const id = (props as { params: { id: string } }).params.id;
  const supabase = await createClient();
  
  // Fetch the product
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product || product.type !== "event") {
    notFound();
  }

  // Fetch the event details
  const { data: eventDetails } = await supabase
    .from("events")
    .select("*")
    .eq("product_id", product.id)
    .single();

  if (!eventDetails) {
    notFound();
  }

  const eventDate = new Date(eventDetails.event_date);
  const isUpcoming = new Date() < eventDate;
  
  // Format date and time
  const formattedDate = format(eventDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedTime = format(eventDate, "HH:mm", { locale: es });

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
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.title}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow sm:rounded-lg">
          {/* Event header with status badge */}
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isUpcoming
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isUpcoming ? "Próximo" : "Finalizado"}
            </span>
            
            <span className="text-gray-500">
              {formattedDate}
            </span>
          </div>
          
          {/* Event content */}
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
              
              {/* Details */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">Detalles del evento</h2>
                <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formattedDate}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Hora</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formattedTime}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Duración</dt>
                    <dd className="mt-1 text-sm text-gray-900">{eventDetails.duration_minutes} minutos</dd>
                  </div>
                  
                  {eventDetails.capacity && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Capacidad</dt>
                      <dd className="mt-1 text-sm text-gray-900">{eventDetails.capacity} personas</dd>
                    </div>
                  )}
                  
                  {/* Hide exact location - only show whether it's online or in-person */}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Tipo de evento</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
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
                          d={eventDetails.location
                            ? "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          }
                        />
                      </svg>
                      {eventDetails.location ? "Evento presencial" : "Evento online"}
                    </dd>
                  </div>
                  
                  {/* Information available only after purchase message */}
                  <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Información disponible después de la compra</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Los detalles completos del evento, incluyendo {eventDetails.location ? "la dirección exacta" : "el enlace de conexión"}, 
                              estarán disponibles después de realizar tu compra.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Sidebar - 1/3 width */}
            <div className="md:col-span-1">
              <ProductSidebar 
                product={product} 
                isUpcoming={isUpcoming} 
                eventCapacity={eventDetails.capacity}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
