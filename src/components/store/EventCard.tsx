import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Product, Event } from "@/types/database";

interface EventWithDetails extends Product {
  event: Event | null;
}

interface EventCardProps {
  event: EventWithDetails;
}

export default function EventCard({ event }: EventCardProps) {
  if (!event.event) return null;
  
  const eventDetails = event.event;
  const eventDate = new Date(eventDetails.event_date);
  const isUpcoming = new Date() < eventDate;
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
      {/* Event status badge */}
      <div className="p-5 pb-0 flex justify-between items-start">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isUpcoming
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isUpcoming ? "Próximo" : "Finalizado"}
        </span>
        
        <span className="text-sm text-gray-500">
          {format(eventDate, "d 'de' MMMM", { locale: es })}
        </span>
      </div>
      
      {/* Card content */}
      <div className="px-5 pt-4 pb-5 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
        
        <div className="mb-3 flex-grow">
          <p className="text-sm text-gray-600 line-clamp-3">
            {event.description || "Sin descripción disponible"}
          </p>
        </div>
        
        <div className="mt-2 space-y-2 text-sm text-gray-500">
          {/* Time */}
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{format(eventDate, "HH:mm")} • {eventDetails.duration_minutes} minutos</span>
          </div>
          
          {/* Type of event (online or in-person) - without revealing details */}
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
                d={
                  eventDetails.location
                    ? "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                }
              />
            </svg>
            <span>{eventDetails.location ? "Evento presencial" : "Evento online"}</span>
          </div>
        </div>
        
        {/* Price and action */}
        <div className="mt-4 flex items-center justify-between">
          <div className="font-semibold">
            {event.price === 0
              ? "Gratis"
              : new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(event.price)}
          </div>
          
          {isUpcoming && (
            <Link
              href={`/store/event/${event.id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver detalles
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
