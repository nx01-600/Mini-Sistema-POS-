import React, { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion, Timestamp } from "firebase/firestore";

export default function GenerarVentasDemo() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const generarVentas = async () => {
    setLoading(true);
    setMensaje("");
    try {
      const userEmail = "nicolasct0627@gmail.com";
      // Obtener productos disponibles
      const productosSnap = await getDocs(collection(db, "productos"));
      const productosArr = [];
      productosSnap.forEach(docu => {
        productosArr.push({ id: docu.id, ...docu.data() });
      });
      if (productosArr.length === 0) throw new Error("No hay productos en la base de datos");
      // Generar 30 ventas
      for (let i = 0; i < 30; i++) {
        // Seleccionar entre 1 y 4 productos al azar
        const numProductos = Math.floor(Math.random() * 4) + 1;
        const productosVenta = [];
        const usados = new Set();
        while (productosVenta.length < numProductos) {
          const idx = Math.floor(Math.random() * productosArr.length);
          if (!usados.has(idx)) {
            usados.add(idx);
            const prod = productosArr[idx];
            productosVenta.push({
              productoId: prod.id,
              cantidad: Math.floor(Math.random() * 3) + 1,
              nombre: prod.nombre,
              precio: prod.precio
            });
          }
        }
        // Fecha: días consecutivos hacia atrás desde hoy
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - (29 - i));
        fecha.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
        // Total
        const total = productosVenta.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
        // Crear venta
        const venta = {
          productos: productosVenta,
          fecha: Timestamp.fromDate(fecha),
          total,
          userId: userEmail
        };
        const ventaRef = await addDoc(collection(db, "ventas"), venta);
        // Agregar el id de la venta al usuario
        const userDocRef = doc(db, "users", userEmail);
        await updateDoc(userDocRef, {
          ventasIds: arrayUnion(ventaRef.id)
        });
      }
      setMensaje("Ventas demo generadas correctamente.");
    } catch (err) {
      setMensaje("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Generar Ventas Demo</h2>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold"
        onClick={generarVentas}
        disabled={loading}
      >
        {loading ? "Generando..." : "Generar 30 ventas demo"}
      </button>
      {mensaje && <div className="mt-6 text-center font-semibold text-green-700">{mensaje}</div>}
    </div>
  );
}
