import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, Timestamp, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { addUserPurchaseNotification } from "../utils/notifications";
import { addGlobalStockNotification } from "../utils/globalNotifications";
import { FaSearch, FaShoppingCart, FaTimes, FaMoneyBillWave, FaCreditCard, FaUniversity } from "react-icons/fa";
import { Modal, Radio, Spin, Button } from "antd";
import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import "../styles/paymentModal.css";

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
  
  // Estados para el modal de método de pago
  const [pagoModalVisible, setPagoModalVisible] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);

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

  // Función para abrir el modal de pago
  const abrirModalPago = () => {
    if (carrito.length === 0) return;
    setMensaje("");
    setPagoModalVisible(true);
    setMetodoPago("efectivo"); // Valor por defecto
    setPagoCompletado(false);
  };

  // Función para procesar el pago y completar la compra
  const procesarPago = async () => {
    setProcesandoPago(true);
    
    // Simulamos un breve proceso de pago (1.5 segundos)
    setTimeout(async () => {
      setPagoCompletado(true);
      
      // Esperar 1 segundo más para mostrar la confirmación
      setTimeout(async () => {
        await finalizarCompra();
        setProcesandoPago(false);
        setPagoModalVisible(false);
      }, 1500);
    }, 1500);
  };
  
  // Función para finalizar la compra después del pago
  const finalizarCompra = async () => {
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
    // Actualizar stock y crear notificaciones para productos con stock 0
    for (const { ref, nuevoStock } of productosActualizados) {
      // Actualizar el stock
      await updateDoc(ref, { stock: nuevoStock });
      
      // Si el stock llega a 0, crear una notificación global
      if (nuevoStock === 0) {
        const prodSnap = await getDoc(ref);
        const nombre = prodSnap.exists() ? prodSnap.data().nombre : "";
        
        // Agregar notificación global con el id como clave
        await addGlobalStockNotification(ref.id, nombre, "compra");
        console.log("Notificación agregada para producto con stock 0 por compra:", nombre);
      }
    }
    // Guardar venta con productos, total, fecha, id del usuario y método de pago
    const venta = {
      productos: carrito.map((p) => ({
        productoId: p.id,
        cantidad: p.cantidad,
        nombre: p.nombre,
        precio: p.precio,
      })),
      fecha: Timestamp.now(),
      total: carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0),
      userId: user.email,
      metodoPago: metodoPago // Guardamos el método de pago seleccionado
    };
    const ventaRef = await addDoc(collection(db, "ventas"), venta);

    // Agregar SOLO el id de la venta al arreglo "ventasIds" del usuario en users
    const userDocRef = doc(db, "users", user.email);
    await updateDoc(userDocRef, {
      ventasIds: arrayUnion(ventaRef.id)
    });

    // Notificación push al usuario por compra exitosa
    await addUserPurchaseNotification(user.email, venta.productos, Date.now());

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

    // Refrescar notificaciones en topbar si existe window.actualizarNotificaciones
    if (window.actualizarNotificaciones) {
      window.actualizarNotificaciones();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 relative">
      {/* Modal de Método de Pago */}
      <Modal
        title={<div className="text-blue-700 text-xl">Seleccione método de pago</div>}
        open={pagoModalVisible}
        onCancel={() => !procesandoPago && setPagoModalVisible(false)}
        footer={null}
        centered
        maskClosable={!procesandoPago}
        closable={!procesandoPago}
        className="payment-modal"
      >
        {!pagoCompletado ? (
          <>
            <div className="py-4">
              {procesandoPago ? (
                <div className="flex flex-col items-center justify-center p-6">
                  <Spin 
                    indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} 
                    tip="Procesando pago..." 
                    size="large"
                  />
                  <div className="mt-4 text-gray-600">
                    Por favor espere mientras procesamos su pago con {' '}
                    {metodoPago === 'efectivo' && 'Efectivo'}
                    {metodoPago === 'tarjeta' && 'Tarjeta de Crédito'}
                    {metodoPago === 'transferencia' && 'Transferencia Bancaria'}
                  </div>
                </div>
              ) : (
                <Radio.Group 
                  onChange={(e) => setMetodoPago(e.target.value)} 
                  value={metodoPago}
                  className="w-full"
                >
                  <div className="space-y-4">
                    <div className={`p-4 border rounded-xl cursor-pointer transition-all ${metodoPago === 'efectivo' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
                      <Radio value="efectivo" className="w-full">
                        <div className="flex items-center ml-2">
                          <FaMoneyBillWave className="text-green-600 text-xl mr-3" />
                          <div>
                            <div className="font-medium">Efectivo</div>
                            <div className="text-xs text-gray-500">Pago en caja</div>
                          </div>
                        </div>
                      </Radio>
                    </div>
                    
                    <div className={`p-4 border rounded-xl cursor-pointer transition-all ${metodoPago === 'tarjeta' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
                      <Radio value="tarjeta" className="w-full">
                        <div className="flex items-center ml-2">
                          <FaCreditCard className="text-blue-600 text-xl mr-3" />
                          <div>
                            <div className="font-medium">Tarjeta de Crédito/Débito</div>
                            <div className="text-xs text-gray-500">Visa, Mastercard, etc.</div>
                          </div>
                        </div>
                      </Radio>
                    </div>
                    
                    <div className={`p-4 border rounded-xl cursor-pointer transition-all ${metodoPago === 'transferencia' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
                      <Radio value="transferencia" className="w-full">
                        <div className="flex items-center ml-2">
                          <FaUniversity className="text-purple-600 text-xl mr-3" />
                          <div>
                            <div className="font-medium">Transferencia Bancaria</div>
                            <div className="text-xs text-gray-500">Transferencia a cuenta bancaria</div>
                          </div>
                        </div>
                      </Radio>
                    </div>
                  </div>
                </Radio.Group>
              )}
            </div>
            
            <div className="flex justify-end mt-4 gap-3">
              <Button 
                onClick={() => !procesandoPago && setPagoModalVisible(false)} 
                disabled={procesandoPago}
              >
                Cancelar
              </Button>
              <Button 
                type="primary" 
                onClick={procesarPago} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={procesandoPago}
                loading={procesandoPago}
              >
                Confirmar Pago
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircleFilled style={{ fontSize: 64, color: '#52c41a' }} />
            <div className="text-xl font-semibold mt-4">¡Pago completado!</div>
            <div className="text-gray-500 mt-2 text-center">
              Su compra ha sido procesada correctamente con {' '}
              {metodoPago === 'efectivo' && 'Efectivo'}
              {metodoPago === 'tarjeta' && 'Tarjeta de Crédito'}
              {metodoPago === 'transferencia' && 'Transferencia Bancaria'}
            </div>
          </div>
        )}
      </Modal>

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
                  onClick={abrirModalPago}
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
