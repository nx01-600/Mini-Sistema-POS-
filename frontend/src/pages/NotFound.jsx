import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Página no encontrada</h2>
      <p className="text-gray-500 mb-6">La página que buscas no existe o fue movida.</p>
      <a
        href="/"
        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
      >
        Volver al inicio
      </a>
    </div>
  );
}
