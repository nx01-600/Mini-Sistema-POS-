import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSearch } from "react-icons/fa";

export default function Stock() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ precio: 0, stock: 0 });
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState(""); // Nuevo estado para filtro de stock
  const [stockFilterType, setStockFilterType] = useState("gte"); // 'gte', 'lte', 'eq'
  const [filtered, setFiltered] = useState([]);
  const [addForm, setAddForm] = useState({ nombre: "", precio: "", stock: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "productos"));
      const productosArr = [];
      querySnapshot.forEach((docu) => {
        productosArr.push({ id: docu.id, ...docu.data() });
      });
      setProductos(productosArr);
      setLoading(false);
    };
    fetchProductos();
  }, [deleting, adding]);

  useEffect(() => {
    setFiltered(
      productos.filter((p) => {
        const matchesName = p.nombre.toLowerCase().includes(search.toLowerCase());
        let matchesStock = true;
        if (stockFilter !== "") {
          const stockValue = Number(stockFilter);
          if (stockFilterType === "gte") matchesStock = p.stock >= stockValue;
          else if (stockFilterType === "lte") matchesStock = p.stock <= stockValue;
          else if (stockFilterType === "eq") matchesStock = p.stock === stockValue;
        }
        return matchesName && matchesStock;
      })
    );
  }, [productos, search, stockFilter, stockFilterType]);

  const handleEdit = (index, producto) => {
    setEditIndex(index);
    setEditData({ precio: producto.precio, stock: producto.stock });
  };

  const handleSave = async (id) => {
    await updateDoc(doc(db, "productos", id), {
      precio: Number(editData.precio),
      stock: Number(editData.stock),
    });
    setProductos((prev) =>
      prev.map((p, i) =>
        i === editIndex
          ? { ...p, precio: Number(editData.precio), stock: Number(editData.stock) }
          : p
      )
    );
    setEditIndex(null);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    await deleteDoc(doc(db, "productos", id));
    setProductos((prev) => prev.filter((p) => p.id !== id));
    setDeleting(false);
  };

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!addForm.nombre || !addForm.precio || !addForm.stock) return;
    setAdding(true);
    await addDoc(collection(db, "productos"), {
      nombre: addForm.nombre,
      precio: Number(addForm.precio),
      stock: Number(addForm.stock),
    });
    setAddForm({ nombre: "", precio: "", stock: "" });
    setAdding(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      <div className="bg-white/80 rounded-3xl shadow-2xl border border-blue-100 p-8 mb-10">
        <h2 className="text-3xl font-bold mb-6 text-blue-800 text-center drop-shadow">
          Administrar Stock de Productos
        </h2>
        {/* Formulario para agregar producto */}
        <form
          className="flex flex-wrap gap-2 items-end bg-blue-50 rounded-xl shadow p-4 mb-6 border border-blue-100"
          onSubmit={handleAddProduct}
        >
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Nombre</label>
            <input
              name="nombre"
              value={addForm.nombre}
              onChange={handleAddChange}
              className="border rounded px-2 py-1 w-40"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Precio</label>
            <input
              name="precio"
              type="number"
              min={0}
              step="0.01"
              value={addForm.precio}
              onChange={handleAddChange}
              className="border rounded px-2 py-1 w-28"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Stock</label>
            <input
              name="stock"
              type="number"
              min={0}
              value={addForm.stock}
              onChange={handleAddChange}
              className="border rounded px-2 py-1 w-24"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
            disabled={adding}
          >
            <FaPlus /> Agregar
          </button>
        </form>
        {/* Buscador y filtro de stock */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full pl-10"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={stockFilterType}
              onChange={e => setStockFilterType(e.target.value)}
              className="border rounded-lg px-2 py-2"
            >
              <option value="gte">Stock ≥</option>
              <option value="lte">Stock ≤</option>
              <option value="eq">Stock =</option>
            </select>
            <input
              type="number"
              min={0}
              placeholder="Stock"
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="border rounded-lg px-2 py-2 w-24"
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          {loading ? (
            <p className="text-gray-500">Cargando productos...</p>
          ) : (
            <table className="min-w-full bg-white rounded-xl overflow-hidden text-blue-900">
              <thead>
                <tr className="bg-blue-50 text-blue-700">
                  <th className="py-3 px-4 text-left">Nombre</th>
                  <th className="py-3 px-4 text-left">Precio</th>
                  <th className="py-3 px-4 text-left">Stock</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((producto, idx) => (
                  <tr
                    key={producto.id}
                    className="border-b last:border-b-0 hover:bg-blue-50 transition"
                  >
                    <td className="py-2 px-4">{producto.nombre}</td>
                    <td className="py-2 px-4">
                      {editIndex === idx ? (
                        <input
                          type="number"
                          value={editData.precio}
                          min={0}
                          step="0.01"
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, precio: e.target.value }))
                          }
                          className="border rounded px-2 py-1 w-24"
                        />
                      ) : (
                        `$${producto.precio}`
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {editIndex === idx ? (
                        <input
                          type="number"
                          value={editData.stock}
                          min={0}
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, stock: e.target.value }))
                          }
                          className="border rounded px-2 py-1 w-20"
                        />
                      ) : (
                        producto.stock
                      )}
                    </td>
                    <td className="py-2 px-4 flex gap-2 justify-center">
                      {editIndex === idx ? (
                        <>
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow transition"
                            onClick={() => handleSave(producto.id)}
                            title="Guardar"
                          >
                            <FaSave />
                          </button>
                          <button
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded shadow transition"
                            onClick={() => setEditIndex(null)}
                            title="Cancelar"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow transition"
                            onClick={() => handleEdit(idx, producto)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow transition"
                            onClick={() => handleDelete(producto.id)}
                            title="Eliminar"
                            disabled={deleting}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">
                      No hay productos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
