import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import NotFound from "./pages/NotFound.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Stock from "./pages/Stock";
import ReportesVentas from "./pages/ReportesVentas.jsx";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import ComprasUsuario from "./pages/ComprasUsuario";
import HistorialCompras from "./pages/HistorialCompras.jsx";

// Layout para páginas protegidas
function ProtectedLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Esperar un pequeño tiempo para asegurar que Firestore ya guardó el usuario tras login Google
        setTimeout(async () => {
          const userDoc = await getDoc(doc(db, "users", u.email));
          setRol(userDoc.exists() ? userDoc.data().rol : null);
          setLoadingUser(false);
        }, 300);
      } else {
        setRol(null);
        setLoadingUser(false);
      }
    });
    return () => unsub();
  }, []);

  if (loadingUser)
    return (
      <div className="flex items-center justify-center h-screen">Cargando...</div>
    );

  return (
    <>
      {!isLoginPage && <Sidebar rol={rol} />}
      {!isLoginPage && <Topbar />}
      <main
        className="bg-gray-50 h-screen overflow-auto"
        style={{
          marginLeft: !isLoginPage ? "256px" : 0,
          marginTop: !isLoginPage ? "64px" : 0,
        }}
      >
        <Routes>
          {/* Ruta raíz -> Login */}
          <Route path="/" element={<Login />} />

          {/* Rutas para admin */}
          {rol === "admin" && (
            <>
              <Route path="/dashboard/*" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
              <Route path="/stock" element={<ProtectedLayout><Stock /></ProtectedLayout>} />
              <Route path="/historial-compras" element={<ProtectedLayout><HistorialCompras user={user} rol={rol} /></ProtectedLayout>} />
              <Route
                path="/reportes-ventas"
                element={
                  <ProtectedLayout>
                    <ReportesVentas />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/compras"
                element={<ComprasUsuario user={user} />}
              />
              {/* Ruta no encontrada */}
              <Route
                path="*"
                element={
                  <ProtectedLayout>
                    <NotFound />
                  </ProtectedLayout>
                }
              />
            </>
          )}

          {/* Rutas para usuario */}
          {rol === "usuario" && (
            <>
              <Route path="/compras" element={<ProtectedLayout><ComprasUsuario user={user} /></ProtectedLayout>} />
              <Route path="/historial-compras" element={<ProtectedLayout><HistorialCompras user={user} rol={rol} /></ProtectedLayout>} />
            </>
          )}
        </Routes>
      </main>
    </>
  );
}

export default App;
