import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import TestFirebase from "./pages/TestFirebase.jsx";
import NotFound from "./pages/NotFound.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Layout para páginas protegidas
function ProtectedLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/"; // ajusta si tu ruta de login es diferente

  return (
    <>
      {!isLoginPage && <Sidebar />}
      {!isLoginPage && <Topbar />}
      <main
        className="bg-gray-50"
        style={{
          marginLeft: !isLoginPage ? "256px" : 0,
          marginTop: !isLoginPage ? "64px" : 0,
          minHeight: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        <Routes>
          {/* Ruta raíz -> Login */}
          <Route path="/" element={<Login />} />

          {/* Ruta protegida -> Dashboard */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/test-firebase"
            element={
              <ProtectedLayout>
                <TestFirebase />
              </ProtectedLayout>
            }
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
        </Routes>
      </main>
    </>
  );
}

export default App;
