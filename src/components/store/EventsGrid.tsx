import { Product, Event } from "@/types/database";
import EventCard from "./EventCard";
import EmptyState from "./EmptyState";

interface EventWithDetails extends Product {
  event: Event | null;
}

interface EventsGridProps {
  events: EventWithDetails[];
}

export default function EventsGrid({ events }: EventsGridProps) {
  if (events.length === 0) {
    return <EmptyState type="events" />;
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
