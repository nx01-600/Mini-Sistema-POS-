import { NavLink } from "react-router-dom";

const routes = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/test-firebase", label: "Test Firebase" },
  // Agrega aquí más rutas si tienes otras páginas
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">Cordes</div>
      <nav className="flex-1">
        <ul className="space-y-2 px-4 mt-4">
          {routes.map(route => (
            <li key={route.path}>
              <NavLink
                to={route.path}
                className={({ isActive }) =>
                  `block p-2 rounded-lg hover:bg-gray-700 transition ${
                    isActive ? "bg-gray-700 font-semibold" : ""
                  }`
                }
              >
                {route.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
