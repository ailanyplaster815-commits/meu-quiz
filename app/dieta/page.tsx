
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Dieta() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState<any>(null);
  const [dieta, setDieta] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;
    let uidEmProcessamento: string | null = null;

    async function carregarDieta(user: any) {
      try {
        // 1. Verificar comprador
        const compradorRef = doc(db, "compradores", user.uid);
        const compradorSnap = await getDoc(compradorRef);

        if (!ativo) return;

        if (!compradorSnap.exists()) {
          alert("Você ainda não possui acesso à dieta.");
          router.replace("/preparando");
          return;
        }

        const comprador = compradorSnap.data();

        // 2. Verificar pagamento
        if (comprador.pagamentoStatus !== "pago") {
          alert("Seu pagamento ainda não foi confirmado.");
          router.replace("/preparando");
          return;
        }

        if (!ativo) return;

        // 3. Obter token
        const token = await user.getIdToken();

        if (!ativo) return;

        // 4. Solicitar geração da dieta
        let response: Response | null = null;
        let resultado: any = null;

        for (let tentativa = 0; tentativa < 12; tentativa++) {
          if (!ativo) return;

          response = await fetch("/api/gerar-dieta", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!ativo) return;

          resultado = await response.json();

          if (!ativo) return;

          if (response.status !== 202) {
            break;
          }

          if (tentativa === 11) {
            throw new Error(
              "A geração está demorando mais que o esperado. Tente novamente."
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 5000));

          if (!ativo) return;
        }

        if (!response) {
          throw new Error(
            "Não foi possível solicitar a geração da dieta."
          );
        }

        // 5. Conferir resultado
        if (!response.ok || !resultado.sucesso) {
          throw new Error(
            resultado.erro ||
              resultado.mensagem ||
              "Não foi possível carregar sua dieta."
          );
        }

        if (!ativo) return;

        // 6. Exibir dieta
        setDados(resultado.dados);
        setDieta(resultado.dieta);
        setCarregando(false);

      } catch (error) {
        if (!ativo) return;

        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          console.warn(
            "Operação cancelada durante o carregamento da dieta."
          );
          return;
        }

        console.error("Erro ao carregar dieta:", error);

        setMensagem(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar sua dieta."
        );

        setCarregando(false);
        uidEmProcessamento = null;
      }
    }

    // 7. Observar autenticação sem iniciar chamadas duplicadas
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!ativo) return;

      if (!user) {
        router.replace("/");
        return;
      }

      if (uidEmProcessamento === user.uid) {
        return;
      }

      uidEmProcessamento = user.uid;

      carregarDieta(user);
    });

    // 8. Limpar observador ao desmontar
    return () => {
      ativo = false;
      unsubscribe();
    };
  }, [router]);

  if (carregando) {
    return (
      <main style={{ padding: 30 }}>
        <h2>Preparando sua dieta personalizada...</h2>
        <p>Estamos organizando suas informações. Aguarde.</p>
      </main>
    );
  }

  if (mensagem) {
    return (
      <main style={{ padding: 30 }}>
        <h2>Informação sobre sua dieta</h2>
        <p>{mensagem}</p>
      </main>
    );
  }

  if (!dados || !dieta) {
    return null;
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Sua Dieta</h1>
      <hr />

      <p><strong>Nome:</strong> {dados.nome}</p>
      <p><strong>Objetivo:</strong> {dados.objetivo}</p>
      <p><strong>Peso:</strong> {dados.peso} kg</p>
      <p><strong>Altura:</strong> {dados.altura} cm</p>
      <p><strong>Idade:</strong> {dados.idade}</p>
      <p><strong>Sexo:</strong> {dados.sexo}</p>
      <p><strong>Rotina:</strong> {dados.rotina}</p>
      <p><strong>Atividade:</strong> {dados.atividade}</p>
      <p><strong>Treino:</strong> {dados.treino}</p>

      <hr />

      <h2>Sua dieta personalizada 🍽️</h2>

      <p>
        <strong>Calorias planejadas:</strong> {dieta.calorias} kcal
      </p>

      {dieta.refeicoes?.map((refeicao: any, index: number) => (
        <div key={index}>
          <h3>{refeicao.titulo}</h3>

          {refeicao.horario && (
            <p>
              <strong>Horário:</strong> {refeicao.horario}
            </p>
          )}

          <ul>
            {refeicao.alimentos?.map(
              (alimento: string, i: number) => (
                <li key={i}>{alimento}</li>
              )
            )}
          </ul>

          {refeicao.observacoes && (
            <p>{refeicao.observacoes}</p>
          )}
        </div>
      ))}

      <hr />

      <h2>Estimativa nutricional diária</h2>

      <p><strong>Calorias:</strong> {dieta.calorias} kcal</p>
      <p><strong>Proteínas:</strong> {dieta.proteinas} g</p>
      <p><strong>Carboidratos:</strong> {dieta.carboidratos} g</p>
      <p><strong>Gorduras:</strong> {dieta.gorduras} g</p>

      <p><strong>Alimentos escolhidos:</strong></p>

      <ul>
        {dados.alimentos?.map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <hr />

      <p>
        Esta é uma sugestão geral de planejamento alimentar,
        não substitui a avaliação individual de um nutricionista.
      </p>
    </main>
  );
}
