import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

function TestFirebase() {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState("");

  // Referencia a la colección
  const testCollection = collection(db, "test");

  // Obtener datos
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(testCollection);
      const items = querySnapshot.docs.map((docu) => ({
        id: docu.id,
        ...docu.data(),
      }));
      setData(items);
    } catch (error) {
      console.error("❌ Error al leer Firestore:", error);
    }
  };

  // Crear nuevo documento
  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      await addDoc(testCollection, { name: newItem });
      setNewItem(""); // limpiar input
      fetchData(); // refrescar datos
    } catch (error) {
      console.error("❌ Error al agregar:", error);
    }
  };

  // Eliminar documento
  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "test", id));
      fetchData(); // refrescar datos
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">
        📂 CRUD simple en Firestore (colección: test)
      </h1>

      {/* Input y botón para agregar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nuevo item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={addItem}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Agregar
        </button>
      </div>

      {/* Lista de documentos */}
      {data.length > 0 ? (
        <ul className="space-y-2">
          {data.map((item) => (
            <li
              key={item.id}
              className="p-2 border rounded flex justify-between items-center bg-gray-100"
            >
              <span>{item.name || "(sin nombre)"}</span>
              <button
                onClick={() => deleteItem(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                🗑 Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay datos en Firestore</p>
      )}
    </div>
  );
}

export default TestFirebase;
