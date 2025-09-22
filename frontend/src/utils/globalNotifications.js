// Notificaciones globales para admins y de stock
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";

// Agrega una notificación global (stock0 o cualquier tipo)
export async function addGlobalNotification({ tipo = "stock0", productoId, nombre, motivo = "manual", fecha }) {
  const id = Date.now() + Math.random().toString(36).slice(2);
  const noti = {
    tipo,
    productoId,
    nombre,
    motivo,
    fecha: fecha || Date.now(),
    id
  };
  const globalDocRef = doc(db, "notificaciones", "global");
  const snap = await getDoc(globalDocRef);
  if (!snap.exists()) {
    await setDoc(globalDocRef, { [id]: noti });
  } else {
    await updateDoc(globalDocRef, {
      [id]: noti
    });
  }
  return id;
}

// Shortcut para stock0
export async function addGlobalStockNotification(productoId, nombre, motivo) {
  return addGlobalNotification({ tipo: "stock0", productoId, nombre, motivo });
}

// Agrega una notificación genérica (nombre, productoId, fecha)
export async function addGenericGlobalNotification(nombre, productoId) {
  return addGlobalNotification({ tipo: "info", productoId, nombre });
}

// Obtiene todas las notificaciones globales
export async function getGlobalNotifications() {
  const globalDocRef = doc(db, "notificaciones", "global");
  const snap = await getDoc(globalDocRef);
  if (!snap.exists()) {
    await setDoc(globalDocRef, {});
    return {};
  }
  // Retorna objeto con notificaciones por id
  const data = snap.data();
  // Filtra solo notificaciones tipo stock0
  const notis = {};
  Object.keys(data).forEach(key => {
    if (data[key]?.tipo === "stock0") notis[key] = data[key];
  });
  return notis;
}

// Elimina una notificación global (solo si el producto tiene stock > 0 o fue borrado)
export async function removeGlobalNotification(notiId) {
  const globalDocRef = doc(db, "notificaciones", "global");
  await updateDoc(globalDocRef, { [notiId]: null });
}

// Verifica si el producto tiene stock > 0 o fue borrado
export async function canRemoveStockNotification(productoId) {
  // Si no hay productoId, no permitir eliminar
  if (!productoId) return false;
  
  const prodRef = doc(db, "productos", productoId);
  const snap = await getDoc(prodRef);
  
  // Si el producto no existe (fue borrado), permitir eliminar la notificación
  if (!snap.exists()) return true;
  
  // Si el producto existe, permitir eliminar solo si el stock es mayor que 0
  return (snap.data().stock || 0) > 0;
}
