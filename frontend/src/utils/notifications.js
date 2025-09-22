// Notificaciones para compras de usuario
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Agrega una notificación de compra exitosa al usuario
export async function addUserPurchaseNotification(email, productos, fecha) {
  const userDocRef = doc(db, "users", email);
  const noti = {
    tipo: "compra",
    productos: productos.map(p => p.nombre),
    fecha: fecha,
    id: Date.now() + Math.random().toString(36).slice(2)
  };
  await updateDoc(userDocRef, {
    notificaciones: arrayUnion(noti)
  });
}

// Obtiene las notificaciones del usuario
export async function getUserNotifications(email) {
  const userDocRef = doc(db, "users", email);
  const snap = await getDoc(userDocRef);
  return snap.exists() ? (snap.data().notificaciones || []) : [];
}

// Elimina una notificación del usuario
export async function removeUserNotification(email, notiId) {
  const userDocRef = doc(db, "users", email);
  const snap = await getDoc(userDocRef);
  if (!snap.exists()) return;
  const notificaciones = (snap.data().notificaciones || []).filter(n => n.id !== notiId);
  await updateDoc(userDocRef, { notificaciones });
}
