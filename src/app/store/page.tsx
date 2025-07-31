import { Metadata } from "next";
import StoreNavigation from "@/components/store/StoreNavigation";
import EventsGrid from "@/components/store/EventsGrid";
import DigitalContentGrid from "@/components/store/DigitalContentGrid";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Encuadrado | Tienda de eventos y materiales digitales para profesionales",
  description: "Descubre eventos profesionales y contenido digital de alta calidad para tu desarrollo profesional.",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  // Get the active tab from URL params or default to 'events'
  const activeTab = searchParams.tab === "digital" ? "digital" : "events";
  
  // Initialize Supabase client (server-side)
  const supabase = await createClient();
  
  // Fetch products data based on active tab
  let events = [];
  let digitalContents = [];
  
  // Always fetch both to prevent loading state when switching tabs
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (productsData) {
    // Fetch events details
    const { data: eventsData } = await supabase
      .from("events")
      .select("*");
      
    // Fetch digital content details
    const { data: digitalData } = await supabase
      .from("digital_contents")
      .select("*");
    
    // Combine products with their details
    events = productsData
      .filter(product => product.type === "event")
      .map(product => {
        const eventDetails = eventsData?.find(event => event.product_id === product.id);
        return {
          ...product,
          event: eventDetails || null,
        };
      });
    
    digitalContents = productsData
      .filter(product => product.type === "digital_content")
      .map(product => {
        const contentDetails = digitalData?.find(content => content.product_id === product.id);
        return {
          ...product,
          digitalContent: contentDetails || null,
        };
      });
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Encuadrado</h1>
          <p className="text-gray-600 mt-1">Marketplace para profesionales</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <StoreNavigation activeTab={activeTab} />
        
        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "events" && (
            <EventsGrid events={events} />
          )}
          
          {activeTab === "digital" && (
            <DigitalContentGrid digitalContents={digitalContents} />
          )}
        </div>
      </main>
    </div>
  );
}
