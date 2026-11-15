
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { adminDb, adminAuth } from "@/app/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

function converterNumero(valor: unknown): number {
  if (typeof valor === "number") return valor;
  if (typeof valor === "string") {
    return Number(valor.trim().replace(",", "."));
  }
  return NaN;
}

export async function POST(request: Request) {
  let uid = "";
  let reservouGeracao = false;

  try {
    // 1. Verificar autenticação
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return NextResponse.json(
        { erro: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const usuario = await adminAuth.verifyIdToken(token);
    uid = usuario.uid;

    // 2. Consultar pagamento, questionário e dieta existente
    const compradorRef = adminDb.collection("compradores").doc(uid);
    const quizRef = adminDb.collection("quizzes").doc(uid);
    const dietaRef = adminDb.collection("dietas").doc(uid);

    const resultado = await adminDb.runTransaction(async (transaction) => {
      const compradorSnap = await transaction.get(compradorRef);
      const quizSnap = await transaction.get(quizRef);
      const dietaSnap = await transaction.get(dietaRef);

      if (!compradorSnap.exists) {
        throw new Error("COMPRADOR_NAO_ENCONTRADO");
      }

      const comprador = compradorSnap.data()!;

      if (comprador.pagamentoStatus !== "pago") {
        throw new Error("PAGAMENTO_NAO_CONFIRMADO");
      }

      if (!quizSnap.exists) {
        throw new Error("QUESTIONARIO_NAO_ENCONTRADO");
      }

      const quiz = quizSnap.data()!;

      // Normalizar os dados numéricos
      const peso = converterNumero(quiz.peso);
      const altura = converterNumero(quiz.altura);
      const idade = converterNumero(quiz.idade);

      if (
        !Number.isFinite(peso) || peso <= 0 ||
        !Number.isFinite(altura) || altura <= 0 ||
        !Number.isFinite(idade) || idade <= 0 ||
        !quiz.objetivo ||
        !quiz.sexo
      ) {
        throw new Error("QUESTIONARIO_INCOMPLETO");
      }

      const dadosQuiz = {
        ...quiz,
        nome: quiz.nome || comprador.nome || "Cliente",
        peso,
        altura,
        idade,
        objetivo: quiz.objetivo,
        sexo: quiz.sexo,
        horario: quiz.horario || "",
        rotina: quiz.rotina || "",
        atividade: quiz.atividade || "",
        treino: quiz.treino || "",
        observacao: quiz.observacao || "",
        alimentos: Array.isArray(quiz.alimentos) ? quiz.alimentos : [],
      };

      // Reutilizar dieta já gerada
      if (
        dietaSnap.exists &&
        dietaSnap.data()?.status === "pronta"
      ) {
        return {
          tipo: "pronta" as const,
          dieta: dietaSnap.data()?.dieta,
          dados: dadosQuiz,
        };
      }

      // Evitar gerações simultâneas
      const dietaAtual = dietaSnap.data();
      const lockUntil = dietaAtual?.lockUntil;

      if (
        dietaAtual?.status === "gerando" &&
        lockUntil instanceof Timestamp &&
        lockUntil.toMillis() > Date.now()
      ) {
        return { tipo: "gerando" as const };
      }

      transaction.set(
        dietaRef,
        {
          status: "gerando",
          lockUntil: Timestamp.fromMillis(Date.now() + 5 * 60 * 1000),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return {
        tipo: "nova" as const,
        dados: dadosQuiz,
      };
    });

    if (resultado.tipo === "pronta") {
      return NextResponse.json({
        sucesso: true,
        dieta: resultado.dieta,
        dados: resultado.dados,
        jaExistia: true,
      });
    }

    if (resultado.tipo === "gerando") {
      return NextResponse.json(
        {
          sucesso: false,
          status: "gerando",
          mensagem: "Sua dieta está sendo preparada. Tente novamente em instantes.",
        },
        { status: 202 }
      );
    }

    reservouGeracao = true;
    const dados = resultado.dados;

    // 3. Conferir chave do Gemini
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_NAO_CONFIGURADA");
    }

    // 4. Preparar dados do questionário para o Gemini
    const prompt = `
Você é um assistente que cria sugestões gerais de planejamento alimentar.

Use os dados reais abaixo para criar uma sugestão de plano alimentar.

Peso: ${dados.peso} kg
Altura: ${dados.altura} cm
Idade: ${dados.idade}
Objetivo: ${dados.objetivo}
Sexo: ${dados.sexo}
Horário preferido: ${dados.horario}
Rotina: ${dados.rotina}
Atividade física: ${dados.atividade}
Treina: ${dados.treino}
Observações: ${dados.observacao || "Nenhuma"}
Alimentos escolhidos: ${dados.alimentos.join(", ") || "Nenhum informado"}

Responda exclusivamente com JSON válido neste formato:

{
  "calorias": 2000,
  "proteinas": 100,
  "carboidratos": 250,
  "gorduras": 65,
  "refeicoes": [
    {
      "titulo": "Café da manhã",
      "horario": "08:00",
      "alimentos": ["2 ovos", "1 banana"],
      "observacoes": ""
    }
  ]
}

Regras:
- Escreva em português do Brasil.
- Priorize os alimentos escolhidos quando forem compatíveis.
- Informe quantidades aproximadas.
- Organize as refeições conforme o horário preferido.
- Não invente alergias ou condições de saúde.
- Não recomende medicamentos ou suplementos.
- Não apresente a sugestão como diagnóstico ou tratamento médico.
- Retorne somente JSON, sem Markdown.
`;

    // 5. Gerar dieta
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const texto = response.text;

    if (!texto) {
      throw new Error("RESPOSTA_VAZIA_DO_GEMINI");
    }

    const dieta = JSON.parse(texto);

    if (
      !Array.isArray(dieta.refeicoes) ||
      !Number.isFinite(dieta.calorias) ||
      !Number.isFinite(dieta.proteinas) ||
      !Number.isFinite(dieta.carboidratos) ||
      !Number.isFinite(dieta.gorduras)
    ) {
      throw new Error("FORMATO_DE_DIETA_INVALIDO");
    }

    // 6. Salvar dieta para reutilizar nas próximas visitas
    await dietaRef.update({
  status: "pronta",
  dieta,
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
  modelo: "gemini-3.8-flash",
  lockUntil: FieldValue.delete(),
});

    return NextResponse.json({
      sucesso: true,
      dieta,
      dados,
      jaExistia: false,
    });

  } catch (error) {
    console.error("========== ERRO REAL AO GERAR DIETA ==========");
    console.error(error);
    console.error("Mensagem:", error instanceof Error ? error.message : error);
    console.error("Detalhes:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error("==============================================");

    const mensagem = error instanceof Error ? error.message : "";

    if (mensagem === "COMPRADOR_NAO_ENCONTRADO") {
      return NextResponse.json(
        { erro: "Compra não encontrada." },
        { status: 403 }
      );
    }

    if (mensagem === "PAGAMENTO_NAO_CONFIRMADO") {
      return NextResponse.json(
        { erro: "O pagamento ainda não foi confirmado." },
        { status: 403 }
      );
    }

    if (mensagem === "QUESTIONARIO_NAO_ENCONTRADO") {
      return NextResponse.json(
        { erro: "Não encontramos seu questionário." },
        { status: 404 }
      );
    }

    if (mensagem === "QUESTIONARIO_INCOMPLETO") {
      return NextResponse.json(
        { erro: "Seu questionário está incompleto. Confira peso, altura, idade, objetivo e sexo." },
        { status: 422 }
      );
    }

    if (mensagem === "GEMINI_API_KEY_NAO_CONFIGURADA") {
      return NextResponse.json(
        { erro: "Configuração da IA não encontrada no servidor." },
        { status: 500 }
      );
    }

    // Liberar a reserva somente se ela foi criada nesta tentativa
    if (uid && reservouGeracao) {
      try {
        await adminDb.collection("dietas").doc(uid).set(
          {
            status: "erro",
            lockUntil: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (erroAoLiberar) {
        console.error("Erro ao liberar geração:", erroAoLiberar);
      }
    }

    return NextResponse.json(
      {
        sucesso: false,
        erro: "Não foi possível gerar sua dieta. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
