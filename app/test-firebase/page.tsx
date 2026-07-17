"use client";

import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function TestFirebase() {
  const testar = async () => {
    try {
      await addDoc(collection(db, "testes"), {
        mensagem: "Firebase conectado",
        createdAt: new Date(),
      });

      alert("🔥 Funcionou!");
    } catch (error) {
  console.error("ERRO FIREBASE:", error);
  alert(JSON.stringify(error));
}
  };

  return (
    <div className="p-10">
      <button onClick={testar}>
        Testar Firebase
      </button>
    </div>
  );
}