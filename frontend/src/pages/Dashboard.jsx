import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF69B4", "#00CED1", "#FFD700"];

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [ventaIdFiltro, setVentaIdFiltro] = useState("");

  useEffect(() => {
    const db = getFirestore();
    Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "productos")),
      getDocs(collection(db, "ventas"))
    ]).then(([usuariosSnap, productosSnap, ventasSnap]) => {
      setUsuarios(usuariosSnap.docs.map(doc => doc.data()));
      setProductos(productosSnap.docs.map(doc => doc.data()));
      // Guardar ventas con id de documento
      setVentas(ventasSnap.docs.map(doc => ({ ...doc.data(), _docId: doc.id })));
    });
  }, []);

  // Estadísticas
  const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
  const ventasPorDia = ventas.reduce((acc, v) => {
    const fecha = v.fecha?.toDate ? v.fecha.toDate().toISOString().slice(0, 10) : v.fecha.slice(0, 10);
    acc[fecha] = (acc[fecha] || 0) + v.total;
    return acc;
  }, {});
  const ventasPorDiaData = Object.entries(ventasPorDia).map(([fecha, total]) => ({ fecha, total }));

  // Productos más vendidos
  const productosVendidos = {};
  ventas.forEach(v => {
    v.productos.forEach(p => {
      productosVendidos[p.productoId] = (productosVendidos[p.productoId] || 0) + p.cantidad;
    });
  });
  const productosVendidosData = productos
    .map(p => ({
      name: p.nombre,
      value: productosVendidos[p.id] || 0
    }))
    .filter(p => p.value > 0);

  // Stock actual
  const stockData = productos.map(p => ({
    name: p.nombre,
    stock: p.stock
  }));

  // Producto con más stock
  const productoMasStock = productos.reduce((max, p) => p.stock > (max?.stock || 0) ? p : max, null);

  // Venta más alta
  const ventaMasAlta = ventas.reduce((max, v) => v.total > (max?.total || 0) ? v : max, null);

  // Ingreso promedio por venta
  const ingresoPromedio = ventas.length ? (totalVentas / ventas.length) : 0;

  // Visual soft y bonito
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-8 py-8 overflow-auto" style={{ paddingBottom: "48px" }}>
      <h1 className="text-4xl font-bold text-blue-800 mb-10 text-center drop-shadow">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
        <div className="bg-white/80 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-blue-100">
          <div className="text-3xl font-bold text-blue-600">${totalVentas.toLocaleString("es-CO")}</div>
          <div className="text-blue-700 mt-2 font-medium">Total Ventas</div>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-blue-100">
          <div className="text-3xl font-bold text-green-600">{productos.length}</div>
          <div className="text-blue-700 mt-2 font-medium">Productos</div>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-blue-100">
          <div className="text-3xl font-bold text-purple-600">{usuarios.length}</div>
          <div className="text-blue-700 mt-2 font-medium">Usuarios</div>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-blue-100">
          <div className="text-3xl font-bold text-yellow-600">${ingresoPromedio.toLocaleString("es-CO", {maximumFractionDigits: 0})}</div>
          <div className="text-blue-700 mt-2 font-medium">Ingreso Promedio por Venta</div>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-blue-100">
          <div className="text-2xl font-bold text-cyan-600">{productoMasStock?.nombre || "-"}</div>
          <div className="text-blue-700 mt-2 font-medium">Producto con más stock</div>
          <div className="text-lg text-blue-400">Stock: {productoMasStock?.stock || "-"}</div>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-blue-100">
          <div className="text-2xl font-bold text-pink-600">{ventaMasAlta?._docId || "-"}</div>
          <div className="text-blue-700 mt-2 font-medium">Venta más alta</div>
          <div className="text-lg text-blue-400">Total: ${ventaMasAlta?.total?.toLocaleString("es-CO") || "-"}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Ventas por Día</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ventasPorDiaData}>
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Productos Más Vendidos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={productosVendidosData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {productosVendidosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Stock Actual</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Detalle de Ventas Recientes</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filtrar por ID de compra..."
              value={ventaIdFiltro}
              onChange={e => setVentaIdFiltro(e.target.value)}
              className="border border-blue-200 rounded-lg px-4 py-2 w-full max-w-xs focus:ring-2 focus:ring-blue-300 bg-blue-50"
            />
          </div>
          <div className="overflow-auto max-h-64">
            <table className="min-w-full text-left text-blue-900">
              <thead>
                <tr>
                  <th className="font-semibold py-2">ID</th>
                  <th className="font-semibold py-2">Fecha</th>
                  <th className="font-semibold py-2">Total</th>
                  <th className="font-semibold py-2">Productos</th>
                </tr>
              </thead>
              <tbody>
                {ventas
                  .filter(v => v._docId?.toLowerCase().includes(ventaIdFiltro.toLowerCase()))
                  .slice(-10)
                  .reverse()
                  .map(v => (
                  <tr key={v._docId} className="border-b">
                    <td className="py-2">{v._docId}</td>
                    <td className="py-2">{v.fecha?.toDate ? v.fecha.toDate().toLocaleDateString("es-CO") : v.fecha.slice(0,10)}</td>
                    <td className="py-2">${v.total.toLocaleString("es-CO")}</td>
                    <td className="py-2">
                      {v.productos.map(p => (
                        <span key={p.productoId} className="inline-block bg-blue-50 rounded px-2 py-1 mr-1">
                          {p.productoId} x{p.cantidad}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
