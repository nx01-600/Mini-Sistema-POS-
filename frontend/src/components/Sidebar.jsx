import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaBoxes, FaChartBar, FaShoppingCart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Sidebar({ rol }) {
  let routes = [];
  if (rol === "admin") {
    routes = [
      { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
      { path: "/stock", label: "Stock", icon: <FaBoxes /> },
      { path: "/reportes-ventas", label: "Reportes de Ventas", icon: <FaChartBar /> },
      { path: "/compras", label: "Comprar productos", icon: <FaShoppingCart /> },
      { path: "/historial-compras", label: "Historial de Compras", icon: <FaChartBar /> },
    ];
  } else if (rol === "usuario") {
    routes = [
      { path: "/compras", label: "Comprar productos", icon: <FaShoppingCart /> },
      { path: "/historial-compras", label: "Historial de Compras", icon: <FaChartBar /> },
    ];
  }
  if (!rol) return null;
  return (
    <aside
      className="fixed left-0 top-0 w-64 bg-gray-800 text-white h-screen flex flex-col z-20 shadow-xl border-r border-gray-800"
      style={{ height: "100vh" }}
    >
      <div className="p-6 text-2xl font-bold border-b border-gray-200 text-center tracking-wide text-white">
        MiniSistema POS
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 px-4 mt-6">
          {routes.map((route) => (
            <li key={route.path}>
              <NavLink
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-white shadow font-semibold text-blue-600"
                      : "hover:bg-white/80 hover:text-blue-500"
                  }`
                }
              >
                <span className="text-lg">{route.icon}</span>
                <span>{route.label}</span>
              </NavLink>

            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto mb-4 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} MiniSistema POS
      </div>
    </aside>
  );
}
