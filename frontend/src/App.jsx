import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login.jsx"
import DashboardLayout from "./layouts/DashboardLayout.jsx"
import TestFirebase from "./pages/TestFirebase.jsx";

function App() {
  return (
    <Routes>
      {/* Ruta raíz -> Login */}
      <Route path="/" element={<Login />} />

      {/* Ruta protegida -> Dashboard */}
      <Route path="/dashboard/*" element={<DashboardLayout />} />
      <Route path="/test-firebase" element={<TestFirebase />} />
    </Routes>
  )
}

export default App
