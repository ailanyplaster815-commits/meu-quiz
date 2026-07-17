"use client";

import { auth } from "../lib/firebase";
import { criarComprador } from "../lib/comprador";

export default function TesteComprador() {

  async function testar() {

    const user = auth.currentUser;

    if (!user) {
      alert("Faça login.");
      return;
    }

    try {

      await criarComprador(user.uid);

      alert("Comprador criado com sucesso!");

    } catch (error) {

      console.error(error);
      alert("Erro ao criar comprador.");

    }
  }

  return (
    <main style={{ padding: 40 }}>

      <h1>Teste Comprador</h1>

      <button onClick={testar}>
        Criar comprador
      </button>

    </main>
  );
}