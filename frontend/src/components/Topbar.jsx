import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function Topbar() {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user.displayName || user.email || "Usuario");
      } else {
        setDisplayName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex-1 flex justify-end items-center gap-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 bg-gray-50"
          />
          <span className="absolute right-3 top-2 text-gray-400">
            <i className="fas fa-search"></i>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium flex items-center">
            <i className="fas fa-user-circle text-xl mr-1"></i>
            {displayName}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
            title="Cerrar sesión"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
