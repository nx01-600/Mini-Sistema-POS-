import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

export default function ReportesVentas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]); // array de ids
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [ventaIdFiltro, setVentaIdFiltro] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const productosSnap = await getDocs(collection(db, "productos"));
      const productosArr = [];
      productosSnap.forEach((docu) => {
        productosArr.push({ id: docu.id, ...docu.data() });
      });
      setProductos(productosArr);

      const ventasSnap = await getDocs(collection(db, "ventas"));
      const ventasArr = [];
      ventasSnap.forEach((docu) => {
        ventasArr.push({ id: docu.id, ...docu.data() });
      });
      setVentas(ventasArr);
    };
    fetchData();
  }, []);

  // Autocompletado de productos
  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
    } else {
      setSuggestions(
        productos.filter(
          (p) =>
            p.nombre.toLowerCase().includes(search.toLowerCase()) &&
            !selectedProductos.includes(p.id)
        )
      );
    }
  }, [search, productos, selectedProductos]);

  // Filtrar ventas por productos seleccionados, id y rango de fechas
  useEffect(() => {
    let filtradas = ventas;
    if (selectedProductos.length > 0) {
      filtradas = filtradas.filter((venta) =>
        venta.productos.some((p) => selectedProductos.includes(p.productoId))
      );
    }
    if (ventaIdFiltro.trim() !== "") {
      filtradas = filtradas.filter((venta) =>
        (venta.id || venta._docId || "").toLowerCase().includes(ventaIdFiltro.toLowerCase())
      );
    }
    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      filtradas = filtradas.filter((venta) => {
        const fechaVenta = venta.fecha?.toDate
          ? venta.fecha.toDate()
          : new Date(venta.fecha);
        return fechaVenta >= inicio;
      });
    }
    if (fechaFin) {
      const fin = new Date(fechaFin);
      filtradas = filtradas.filter((venta) => {
        const fechaVenta = venta.fecha?.toDate
          ? venta.fecha.toDate()
          : new Date(venta.fecha);
        // Sumar un día para incluir el día seleccionado
        return fechaVenta <= new Date(fin.getTime() + 24 * 60 * 60 * 1000 - 1);
      });
    }
    setVentasFiltradas(filtradas);
  }, [ventas, selectedProductos, ventaIdFiltro, fechaInicio, fechaFin]);

  // Análisis: solo productos filtrados
  const resumenPorProducto = productos
    .filter((prod) => selectedProductos.length === 0 || selectedProductos.includes(prod.id))
    .map((prod) => {
      let cantidad = 0;
      let total = 0;
      ventasFiltradas.forEach((venta) => {
        venta.productos.forEach((vp) => {
          if (vp.productoId === prod.id) {
            cantidad += vp.cantidad;
            total += vp.cantidad * prod.precio;
          }
        });
      });
      return { ...prod, cantidad, total };
    });

  // Gráfico: líneas por producto filtrado, fechas en X, cantidad en Y
  let chartData = [];
  if (selectedProductos.length > 0) {
    // Agrupar ventas por fecha y producto
    const ventasPorFecha = {};
    ventasFiltradas.forEach((venta) => {
      const fecha = venta.fecha?.toDate
        ? venta.fecha.toDate()
        : new Date(venta.fecha);
      const fechaStr = fecha.toLocaleDateString();
      if (!ventasPorFecha[fechaStr]) ventasPorFecha[fechaStr] = {};
      venta.productos.forEach((vp) => {
        if (selectedProductos.includes(vp.productoId)) {
          if (!ventasPorFecha[fechaStr][vp.productoId]) ventasPorFecha[fechaStr][vp.productoId] = 0;
          ventasPorFecha[fechaStr][vp.productoId] += vp.cantidad;
        }
      });
    });
    // Convertir a array de objetos para recharts
    chartData = Object.entries(ventasPorFecha).map(([fecha, productosObj]) => {
      const entry = { fecha };
      selectedProductos.forEach((pid) => {
        entry[pid] = productosObj[pid] || 0;
      });
      return entry;
    });
    chartData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  // Colores para líneas del gráfico
  const chartColors = [
    "#2563eb", "#f59e42", "#10b981", "#ef4444", "#a21caf", "#eab308", "#0ea5e9", "#6366f1"
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto" style={{ minHeight: "100vh", overflow: "auto" }}>
      <div className="bg-white/80 rounded-3xl shadow-2xl border border-blue-100 p-8 mb-10">
        <h2 className="text-3xl font-bold mb-6 text-blue-800 text-center drop-shadow">Reportes de Ventas</h2>
        <div className="mb-8 flex flex-wrap gap-6 items-end justify-center">
          <div className="w-full max-w-xs relative">
            <label className="block text-sm text-blue-700 mb-1">Buscar producto</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nombre del producto..."
              className="border border-blue-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-300 bg-blue-50"
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg w-full mt-1 shadow max-h-40 overflow-y-auto">
                {suggestions.map((prod) => (
                  <li
                    key={prod.id}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer rounded"
                    onClick={() => {
                      setSelectedProductos((prev) => [...prev, prod.id]);
                      setSearch("");
                      setSuggestions([]);
                    }}
                  >
                    {prod.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm text-blue-700 mb-1">Seleccionados</label>
            <div className="flex flex-wrap gap-2">
              {selectedProductos.map((pid) => {
                const prod = productos.find((p) => p.id === pid);
                return (
                  <span
                    key={pid}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm shadow"
                  >
                    {prod ? prod.nombre : pid}
                    <button
                      className="ml-2 text-blue-500 hover:text-red-500"
                      onClick={() =>
                        setSelectedProductos((prev) => prev.filter((id) => id !== pid))
                      }
                      title="Quitar"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {selectedProductos.length === 0 && (
                <span className="text-gray-400 text-sm">Ninguno</span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 mb-10" style={{ overflowX: "auto" }}>
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Ventas registradas</h3>
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Filtrar por ID de venta</label>
              <input
                type="text"
                placeholder="ID de venta..."
                value={ventaIdFiltro}
                onChange={e => setVentaIdFiltro(e.target.value)}
                className="border border-blue-200 rounded-lg px-4 py-2 w-56 focus:ring-2 focus:ring-blue-300 bg-blue-50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                className="border border-blue-200 rounded-lg px-4 py-2 w-44 focus:ring-2 focus:ring-blue-300 bg-blue-50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                className="border border-blue-200 rounded-lg px-4 py-2 w-44 focus:ring-2 focus:ring-blue-300 bg-blue-50"
              />
            </div>
          </div>
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Fecha</th>
                <th className="py-2 px-4 text-left">Productos</th>
                <th className="py-2 px-4 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map((venta) => (
                <tr key={venta.id || venta._docId} className="border-b last:border-b-0">
                  <td className="py-2 px-4">{venta.id || venta._docId}</td>
                  <td className="py-2 px-4">
                    {venta.fecha?.toDate
                      ? venta.fecha.toDate().toLocaleString()
                      : new Date(venta.fecha).toLocaleString()}
                  </td>
                  <td className="py-2 px-4">
                    <ul className="list-disc ml-4">
                      {venta.productos.map((p, idx) => {
                        const prod = productos.find((pr) => pr.id === p.productoId);
                        return (
                          <li key={idx}>
                            {prod ? prod.nombre : p.productoId} x {p.cantidad}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="py-2 px-4">${venta.total}</td>
                </tr>
              ))}
              {ventasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">
                    No hay ventas para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 mb-8" style={{ overflowX: "auto" }}>
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Análisis de ventas por producto</h3>
          <table className="min-w-full mb-6 text-blue-900">
            <thead>
              <tr className="bg-blue-50 text-blue-700">
                <th className="py-2 px-4 text-left">Producto</th>
                <th className="py-2 px-4 text-left">Cantidad vendida</th>
                <th className="py-2 px-4 text-left">Total vendido</th>
              </tr>
            </thead>
            <tbody>
              {resumenPorProducto.map((prod) => (
                <tr key={prod.id} className="border-b last:border-b-0 hover:bg-blue-50 transition">
                  <td className="py-2 px-4">{prod.nombre}</td>
                  <td className="py-2 px-4">{prod.cantidad}</td>
                  <td className="py-2 px-4">${prod.total.toFixed(2)}</td>
                </tr>
              ))}
              {resumenPorProducto.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-400">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Gráfico solo si hay productos seleccionados */}
          {selectedProductos.length > 0 && chartData.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">
                Gráfico de ventas para:{" "}
                {selectedProductos
                  .map((pid) => productos.find((p) => p.id === pid)?.nombre)
                  .filter(Boolean)
                  .join(", ")}
              </h4>
              <div className="bg-blue-50 rounded-xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {selectedProductos.map((pid, idx) => (
                      <Line
                        key={pid}
                        type="monotone"
                        dataKey={pid}
                        name={productos.find((p) => p.id === pid)?.nombre || pid}
                        stroke={chartColors[idx % chartColors.length]}
                        strokeWidth={3}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {selectedProductos.length > 0 && chartData.length === 0 && (
            <div className="text-gray-500 mt-4">No hay datos de ventas para estos productos.</div>
          )}
        </div>
      </div>
    </div>
  );
}
