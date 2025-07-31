import { Product, DigitalContent } from "@/types/database";
import DigitalContentCard from "./DigitalContentCard";
import EmptyState from "./EmptyState";

interface DigitalContentWithDetails extends Product {
  digitalContent: DigitalContent | null;
}

interface DigitalContentGridProps {
  digitalContents: DigitalContentWithDetails[];
}

export default function DigitalContentGrid({ digitalContents }: DigitalContentGridProps) {
  if (digitalContents.length === 0) {
    return <EmptyState type="digital" />;
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {digitalContents.map((content) => (
          <DigitalContentCard key={content.id} content={content} />
        ))}
      </div>
    </div>
  );
}
