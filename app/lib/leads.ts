import { db } from "./firebase";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export interface Lead {
  email: string;
  origem: "email" | "google";
  uid?: string;
  nome?: string;
}

export async function salvarLead({
  email,
  origem,
  uid,
  nome,
}: Lead) {
  try {
    const emailId = email.trim().toLowerCase();

    await setDoc(
      doc(db, "leads", emailId),
      {
        email: emailId,
        origem,
        uid: uid ?? null,
        nome: nome ?? null,
        etapa: "login",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    console.log("Lead salvo com sucesso!");

    return true;
  } catch (error) {
    console.error("Erro ao salvar lead:", error);
    return false;
  }
}