interface EmptyStateProps {
  type: "events" | "digital";
}

export default function EmptyState({ type }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={
            type === "events"
              ? "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          }
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No hay {type === "events" ? "eventos" : "contenido digital"} disponible
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {type === "events"
          ? "No hay eventos disponibles en este momento. Vuelve pronto para ver nuevas incorporaciones."
          : "No hay contenido digital disponible en este momento. Vuelve pronto para ver nuevas incorporaciones."}
      </p>
    </div>
  );
}
