import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, Timestamp, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { FaSearch, FaShoppingCart, FaTimes } from "react-icons/fa";

export default function ComprasUsuario({ user }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [search, setSearch] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [showCarrito, setShowCarrito] = useState(false);
  const carritoRef = useRef();

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "productos"));
      const productosArr = [];
      querySnapshot.forEach((docu) => {
        productosArr.push({ id: docu.id, ...docu.data() });
      });
      setProductos(productosArr.filter(p => p.stock > 0));
      setLoading(false);
    };
    fetchProductos();
  }, []);

  // Cerrar el dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (carritoRef.current && !carritoRef.current.contains(event.target)) {
        setShowCarrito(false);
      }
    }
    if (showCarrito) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCarrito]);

  // Filtros
  const productosFiltrados = productos.filter((p) => {
    const matchesName = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesMin = precioMin === "" || p.precio >= Number(precioMin);
    const matchesMax = precioMax === "" || p.precio <= Number(precioMax);
    return matchesName && matchesMin && matchesMax;
  });

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id && p.cantidad < producto.stock
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setShowCarrito(true);
  };

  const quitarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const cambiarCantidad = (id, cantidad, stock) => {
    if (cantidad < 1 || cantidad > stock) return;
    setCarrito((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad } : p))
    );
  };

  const realizarCompra = async () => {
    if (carrito.length === 0) return;
    setMensaje("");
    // Verificar stock actualizado
    const productosActualizados = [];
    for (const item of carrito) {
      const ref = doc(db, "productos", item.id);
      const prodSnap = await getDocs(collection(db, "productos"));
      const prod = prodSnap.docs.find(d => d.id === item.id)?.data();
      if (!prod || prod.stock < item.cantidad) {
        setMensaje(`Stock insuficiente para ${item.nombre}`);
        return;
      }
      productosActualizados.push({ ref, nuevoStock: prod.stock - item.cantidad });
    }
    // Actualizar stock
    for (const { ref, nuevoStock } of productosActualizados) {
      await updateDoc(ref, { stock: nuevoStock });
    }
    // Guardar venta SOLO con productos, total y fecha
    const venta = {
      productos: carrito.map((p) => ({
        productoId: p.id,
        cantidad: p.cantidad,
        nombre: p.nombre,
        precio: p.precio,
      })),
      fecha: Timestamp.now(),
      total: carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0),
    };
    const ventaRef = await addDoc(collection(db, "ventas"), venta);

    // Agregar la venta al arreglo "ventas" del usuario en users
    const userDocRef = doc(db, "users", user.email);
    const ventaWithId = { ...venta, id: ventaRef.id };
    await updateDoc(userDocRef, {
      ventas: arrayUnion(ventaWithId)
    });

    setMensaje("¡Compra realizada con éxito!");
    setCarrito([]);
    setShowCarrito(false);
    // Refrescar productos
    const querySnapshot = await getDocs(collection(db, "productos"));
    const productosArr = [];
    querySnapshot.forEach((docu) => {
      productosArr.push({ id: docu.id, ...docu.data() });
    });
    setProductos(productosArr.filter(p => p.stock > 0));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 relative">
      {/* Carrito Dropdown */}
      <div className="fixed top-20 right-10 z-50" ref={carritoRef}>
        <button
          className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition"
          onClick={() => setShowCarrito((v) => !v)}
        >
          <FaShoppingCart size={22} />
          {carrito.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {carrito.length}
            </span>
          )}
        </button>
        {showCarrito && (
          <div className="absolute right-0 mt-2 w-80 bg-white/90 rounded-2xl shadow-2xl border border-blue-100 p-4 max-h-[70vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg text-blue-700">Carrito</span>
              <button className="text-gray-400 hover:text-red-500" onClick={() => setShowCarrito(false)}>
                <FaTimes />
              </button>
            </div>
            {carrito.length === 0 ? (
              <p className="text-gray-500">No hay productos en el carrito.</p>
            ) : (
              <div>
                {carrito.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 mb-2 border-b pb-2">
                    <span className="flex-1 font-medium">{item.nombre}</span>
                    <span className="text-blue-700 font-bold">${item.precio}</span>
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.cantidad}
                      onChange={e => cambiarCantidad(item.id, Number(e.target.value), item.stock)}
                      className="border rounded w-16 px-2 py-1"
                    />
                    <button
                      className="text-red-500 hover:text-red-700 ml-2"
                      onClick={() => quitarDelCarrito(item.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <div className="font-bold mt-4 text-right text-blue-700">
                  Total: ${carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0)}
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-4 float-right"
                  onClick={realizarCompra}
                >
                  Realizar compra
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Filtros y productos */}
      <h2 className="text-3xl font-bold mb-8 text-blue-800 text-center drop-shadow">Comprar productos</h2>
      {mensaje && <div className="mb-4 text-green-600 font-semibold text-center">{mensaje}</div>}
      <div className="bg-white/80 rounded-3xl shadow-2xl border border-blue-100 p-8 mb-10">
        <div className="flex flex-wrap gap-4 mb-8 items-end justify-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-blue-200 rounded-lg px-4 py-2 w-56 pl-10 focus:ring-2 focus:ring-blue-300 bg-blue-50"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div>
            <label className="block text-xs text-blue-700 mb-1">Precio mínimo</label>
            <input
              type="number"
              min={0}
              value={precioMin}
              onChange={e => setPrecioMin(e.target.value)}
              className="border border-blue-200 rounded-lg px-2 py-2 w-28 focus:ring-2 focus:ring-blue-300 bg-blue-50"
              placeholder="Mínimo"
            />
          </div>
          <div>
            <label className="block text-xs text-blue-700 mb-1">Precio máximo</label>
            <input
              type="number"
              min={0}
              value={precioMax}
              onChange={e => setPrecioMax(e.target.value)}
              className="border border-blue-200 rounded-lg px-2 py-2 w-28 focus:ring-2 focus:ring-blue-300 bg-blue-50"
              placeholder="Máximo"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {productosFiltrados.length === 0 && (
            <div className="col-span-full text-gray-400 text-center py-8">
              No hay productos disponibles.
            </div>
          )}
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="bg-blue-50 rounded-2xl shadow p-6 flex flex-col items-center border border-blue-100">
              <span className="font-semibold text-lg mb-1 text-blue-800">{producto.nombre}</span>
              <span className="text-blue-700 font-bold text-xl mb-2">${producto.precio}</span>
              <span className="text-xs text-gray-500 mb-2">Stock: {producto.stock}</span>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-2 w-full transition"
                onClick={() => agregarAlCarrito(producto)}
                disabled={carrito.find((p) => p.id === producto.id)?.cantidad === producto.stock}
              >
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
