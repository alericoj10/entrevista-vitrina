"use client";

import Link from "next/link";

interface StoreNavigationProps {
  activeTab: string;
}

export default function StoreNavigation({ activeTab }: StoreNavigationProps) {
  const tabs = [
    { name: "Eventos", key: "events", href: "/store?tab=events" },
    { name: "Contenido Digital", key: "digital", href: "/store?tab=digital" },
  ];

  return (
    <nav className="border-b border-gray-200">
      <div className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`
                inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium
                ${
                  isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
