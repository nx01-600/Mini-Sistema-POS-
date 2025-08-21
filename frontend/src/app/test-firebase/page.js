"use client";

import { useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function TestFirebasePage() {
  useEffect(() => {
    const run = async () => {
      try {
        // Escribe un documento de prueba
        await addDoc(collection(db, "productos"), {
          nombre: "Producto demo",
          precio: 19900,
          stock: 5,
          creadoEn: new Date()
        });

        // Lee documentos
        const snap = await getDocs(collection(db, "productos"));
        snap.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
        });
      } catch (err) {
        console.error("Error con Firestore:", err);
      }
    };
    run();
  }, []);

  return <h1>Prueba de conexión con Firestore</h1>;
}
