import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { salvarFormulario, obterUsuario } from "./storage";

export async function salvarDadosFormulario(dados: unknown) {
  // Salva localmente
  salvarFormulario(dados);

  const usuario = obterUsuario();

  if (!usuario?.email) {
    return false;
  }

  try {
    await updateDoc(
      doc(db, "leads", usuario.email.toLowerCase()),
      {
        formulario: dados,
        etapa: "formulario",
        updatedAt: serverTimestamp(),
      }
    );

    return true;
  } catch (error) {
    console.error("Erro ao salvar formulário:", error);
    return false;
  }
}