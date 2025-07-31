"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ProductsList from "./ProductsList";
import CreateEventForm from "./CreateEventForm";
import CreateDigitalContentForm from "./CreateDigitalContentForm";
import PurchasesList from "./PurchasesList";
import DiscountCodesList from "./DiscountCodesList";

type TabType =
  | "products"
  | "create-event"
  | "create-digital"
  | "purchases"
  | "discounts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductsList />;
      case "create-event":
        return <CreateEventForm />;
      case "create-digital":
        return <CreateDigitalContentForm />;
      case "purchases":
        return <PurchasesList />;
      case "discounts":
        return <DiscountCodesList />;
      default:
        return <ProductsList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Panel Profesional
          </h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("products")}
              className={`${
                activeTab === "products"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Mis Productos
            </button>
            <button
              onClick={() => setActiveTab("create-event")}
              className={`${
                activeTab === "create-event"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Crear Evento
            </button>
            <button
              onClick={() => setActiveTab("create-digital")}
              className={`${
                activeTab === "create-digital"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Crear Material Digital
            </button>
            <button
              onClick={() => setActiveTab("purchases")}
              className={`${
                activeTab === "purchases"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Ventas
            </button>
            <button
              onClick={() => setActiveTab("discounts")}
              className={`${
                activeTab === "discounts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Códigos de Descuento
            </button>
          </nav>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
