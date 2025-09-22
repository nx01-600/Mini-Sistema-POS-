import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

export default function ReportesVentas() {
  // Función para generar PDF
  const handleDescargarPDF = async () => {
    try {
      console.log("Descarga PDF iniciada");
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      // Encabezado principal
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, 595, 60, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("times", "bold");
      doc.text("Reporte de Ventas", 40, 40);
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      // Filtros
      let filtros = `Fechas: ${fechaInicio ? fechaInicio : "Indefinido"} a ${fechaFin ? fechaFin : "Indefinido"}`;
      let filtrosActivos = [];
      if (selectedProductos.length > 0) {
        const nombres = selectedProductos.map(pid => productos.find(p => p.id === pid)?.nombre).filter(Boolean).join(", ");
        filtros += ` | Productos: ${nombres}`;
        filtrosActivos.push("Productos");
      }
      if (fechaInicio || fechaFin) filtrosActivos.push("Fechas");
      doc.text(filtros, 40, 75);
      if (filtrosActivos.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Filtros aplicados: ${filtrosActivos.join(", ")}`, 40, 90);
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);
      }

  // Tabla de productos más vendidos
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175);
  doc.setFont("times", "bold");
  doc.text("Productos más vendidos", 40, 110);
  doc.setDrawColor(30, 64, 175);
  doc.line(40, 115, 555, 115);
  let y = 125; // Solo un poco de espacio después del título
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("times", "normal");
      // Encabezado tabla
      doc.setLineWidth(0.5);
      doc.rect(40, y, 220, 22);
      doc.rect(260, y, 80, 22);
      doc.text("Nombre", 50, y + 15);
      doc.text("Cantidad", 270, y + 15);
      y += 22;
      const resumen = productos
        .map(prod => {
          let cantidad = 0;
          ventasFiltradas.forEach(venta => {
            venta.productos.forEach(vp => {
              if (vp.productoId === prod.id) cantidad += vp.cantidad;
            });
          });
          return { nombre: prod.nombre, cantidad };
        })
        .filter(r => r.cantidad > 0)
        .sort((a, b) => b.cantidad - a.cantidad);
      let col = 0;
      resumen.forEach((r, idx) => {
  // Calcular altura dinámica según el texto
  const nombreLines = doc.splitTextToSize(r.nombre, 210);
  const rowHeight = Math.max(22, nombreLines.length * 12);
  doc.rect(40, y, 220, rowHeight);
  doc.rect(260, y, 80, rowHeight);
  doc.text(nombreLines, 50, y + 15);
  doc.text(String(r.cantidad), 270, y + 15);
  y += rowHeight;
        col++;
        if (y > 700) {
          doc.addPage();
          y = 60;
          doc.setFontSize(16);
          doc.setTextColor(30, 64, 175);
          doc.setFont("times", "bold");
          doc.text("Productos más vendidos (cont)", 40, y);
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.setFont("times", "normal");
          doc.setLineWidth(0.5);
          doc.rect(40, y + 20, 220, 22);
          doc.rect(260, y + 20, 80, 22);
          doc.text("Nombre", 50, y + 35);
          doc.text("Cantidad", 270, y + 35);
          y += 42;
        }
      });

      // Espacio extra antes de la gráfica
      y += 20;
      // Gráfica de ventas (captura de pantalla)
      const chart = document.querySelector(".recharts-wrapper");
      if (chart) {
        // Si hay poco espacio, crear nueva página para la gráfica
        if (y + 320 > 700) {
          doc.addPage();
          y = 60;
        }
        doc.setFontSize(18);
        doc.setTextColor(30, 64, 175);
        doc.setFont("times", "bold");
        doc.text("Gráfica de Ventas", 40, y);
        y += 20;
        const canvas = await html2canvas(chart, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        doc.setTextColor(0, 0, 0);
        doc.setFont("times", "normal");
        doc.addImage(imgData, "PNG", 40, y, 500, 260);
        y += 280;
      }

      // Espacio extra antes de ventas detalladas
      y += 20;

      // Tabla de ventas filtradas
      if (y + 60 > 700) {
        doc.addPage();
        y = 60;
      }
      doc.setFontSize(18);
      doc.setFont("times", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text("Ventas Detalladas", 40, y);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.setTextColor(0, 0, 0);
      // Encabezado tabla
      doc.setLineWidth(0.5);
      doc.rect(40, y + 20, 80, 22);
      doc.rect(120, y + 20, 100, 22);
      doc.rect(220, y + 20, 80, 22);
      doc.rect(300, y + 20, 255, 22);
      doc.text("ID", 45, y + 35);
      doc.text("Fecha", 125, y + 35);
      doc.text("Total", 225, y + 35);
      doc.text("Productos", 305, y + 35);
      let y2 = y + 42;
      let row = 0;
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      ventasFiltradas.forEach(v => {
        let idStr = v.id.length > 16 ? v.id.slice(0, 13) + "..." : v.id;
        // Calcular altura dinámica según el texto de productos
        const productosArr = v.productos.map(p => `${p.nombre || p.productoId} x${p.cantidad}`);
        let productosStr = productosArr.join(", ");
        let prodLines = [];
        if (productosStr.length > 60) {
          let temp = "";
          productosArr.forEach((prod, idx) => {
            if ((temp + prod).length > 60) {
              prodLines.push(temp);
              temp = prod;
            } else {
              temp += (temp ? ", " : "") + prod;
            }
          });
          if (temp) prodLines.push(temp);
        } else {
          prodLines = [productosStr];
        }
        const rowHeight = Math.max(22, prodLines.length * 12);
        doc.rect(40, y2, 80, rowHeight);
        doc.rect(120, y2, 100, rowHeight);
        doc.rect(220, y2, 80, rowHeight);
        doc.rect(300, y2, 255, rowHeight);
        doc.text(idStr, 45, y2 + 15);
        doc.text(v.fecha?.toDate ? v.fecha.toDate().toLocaleString() : (v.fecha ? String(v.fecha) : "Indefinido"), 125, y2 + 15);
        doc.text("$" + v.total, 225, y2 + 15);
        prodLines.forEach((linea, i) => {
          doc.text(linea, 305, y2 + 15 + (i * 12), { maxWidth: 240 });
        });
        y2 += rowHeight;
        row++;
        if (y2 > 700) {
          doc.addPage();
          y2 = 60;
          doc.setFontSize(18);
          doc.setFont("times", "bold");
          doc.setTextColor(30, 64, 175);
          doc.text("Ventas Detalladas (cont)", 40, y2);
          doc.setFontSize(12);
          doc.setFont("times", "normal");
          doc.setTextColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(40, y2 + 20, 80, 22);
          doc.rect(120, y2 + 20, 100, 22);
          doc.rect(220, y2 + 20, 80, 22);
          doc.rect(300, y2 + 20, 255, 22);
          doc.text("ID", 45, y2 + 35);
          doc.text("Fecha", 125, y2 + 35);
          doc.text("Total", 225, y2 + 35);
          doc.text("Productos", 305, y2 + 35);
          y2 += 42;
          doc.setFontSize(10);
          doc.setFont("times", "normal");
        }
      });

      doc.save("reporte-ventas.pdf");
      alert("PDF generado y descargado correctamente");
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Ocurrió un error al generar el PDF. Revisa la consola para más detalles.");
    }
  };
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
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold mb-6 float-right"
            onClick={handleDescargarPDF}
          >
            Descargar PDF del reporte
          </button>
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
                <tr
                  key={venta.id || venta._docId}
                  className="border-b last:border-b-0 cursor-pointer hover:bg-blue-50"
                  onClick={() => setSelectedProductos(venta.productos.map(p => p.productoId))}
                  title="Visualizar productos de esta venta"
                >
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
