import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

export default function HistorialCompras({ user, rol }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");
  const [productoFiltro, setProductoFiltro] = useState("");
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompras = async () => {
      setLoading(true);
      setError("");
      try {
        let comprasArr = [];
        if (rol === "admin") {
          // Admin: ver todas las compras
          const ventasSnap = await getDocs(collection(db, "ventas"));
          ventasSnap.forEach(docu => {
            comprasArr.push({ id: docu.id, ...docu.data() });
          });
        } else if (user) {
          // Usuario: ver solo sus compras
          const userDoc = await getDoc(doc(db, "users", user.email));
          const ventasIds = userDoc.exists() ? userDoc.data().ventasIds || [] : [];
          for (const ventaId of ventasIds) {
            const ventaDoc = await getDoc(doc(db, "ventas", ventaId));
            if (ventaDoc.exists()) {
              comprasArr.push({ id: ventaId, ...ventaDoc.data() });
            }
          }
        }
        // Ordenar por fecha descendente
        comprasArr.sort((a, b) => {
          const fa = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
          const fb = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
          return fb - fa;
        });
        setCompras(comprasArr);
      } catch (err) {
        setError("Error al cargar compras: " + err.message);
      }
      setLoading(false);
    };
    fetchCompras();
  }, [user, rol]);

  // Filtros
  const comprasFiltradas = compras.filter((compra) => {
    // Fecha
    const fechaCompra = compra.fecha?.toDate ? compra.fecha.toDate() : new Date(compra.fecha);
    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      if (fechaCompra < inicio) return false;
    }
    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (fechaCompra > new Date(fin.getTime() + 24 * 60 * 60 * 1000 - 1)) return false;
    }
    // Valor
    if (valorMin && compra.total < Number(valorMin)) return false;
    if (valorMax && compra.total > Number(valorMax)) return false;
    // Producto
    if (productoFiltro.trim() !== "") {
      const nombreBuscado = productoFiltro.trim().toLowerCase();
      if (!compra.productos.some(p => p.nombre.toLowerCase().includes(nombreBuscado))) return false;
    }
    return true;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 rounded-3xl shadow-xl border border-blue-100">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 text-center drop-shadow">Historial de Compras</h2>
      <div className="bg-white/80 rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
        <div className="flex flex-wrap gap-4 mb-6 items-end justify-center">
          <div>
            <label className="block text-xs text-blue-700 mb-1">Fecha inicio</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border border-blue-200 rounded-lg px-2 py-2 w-36 focus:ring-2 focus:ring-blue-300 bg-blue-50" />
          </div>
          <div>
            <label className="block text-xs text-blue-700 mb-1">Fecha fin</label>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="border border-blue-200 rounded-lg px-2 py-2 w-36 focus:ring-2 focus:ring-blue-300 bg-blue-50" />
          </div>
          <div>
            <label className="block text-xs text-blue-700 mb-1">Valor mínimo</label>
            <input type="number" min={0} value={valorMin} onChange={e => setValorMin(e.target.value)} className="border border-blue-200 rounded-lg px-2 py-2 w-28 focus:ring-2 focus:ring-blue-300 bg-blue-50" placeholder="Mínimo" />
          </div>
          <div>
            <label className="block text-xs text-blue-700 mb-1">Valor máximo</label>
            <input type="number" min={0} value={valorMax} onChange={e => setValorMax(e.target.value)} className="border border-blue-200 rounded-lg px-2 py-2 w-28 focus:ring-2 focus:ring-blue-300 bg-blue-50" placeholder="Máximo" />
          </div>
          <div>
            <label className="block text-xs text-blue-700 mb-1">Producto</label>
            <input type="text" value={productoFiltro} onChange={e => setProductoFiltro(e.target.value)} className="border border-blue-200 rounded-lg px-4 py-2 w-44 focus:ring-2 focus:ring-blue-300 bg-blue-50" placeholder="Buscar producto..." />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : comprasFiltradas.length === 0 ? (
        <div className="text-center text-gray-500">No hay compras registradas.</div>
      ) : (
        <ul className="space-y-6">
          {comprasFiltradas.map((compra) => (
            <li key={compra.id} className="bg-white rounded-2xl shadow p-6 border border-blue-100">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="font-semibold text-blue-700">ID: {compra.id}</span>
                <span className="text-blue-700 font-bold">{compra.fecha?.toDate ? compra.fecha.toDate().toLocaleString() : String(compra.fecha)}</span>
                <span className="font-bold text-green-700">Total: ${compra.total}</span>
              </div>
              <h4 className="font-medium mb-2 text-blue-800">Productos:</h4>
              <ul className="ml-4 list-disc">
                {compra.productos.map((prod, idx) => (
                  <li key={idx} className="text-blue-900">
                    {prod.nombre} x {prod.cantidad} <span className="text-gray-500">(${prod.precio} c/u)</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-gray-500">Usuario: {compra.userId}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
