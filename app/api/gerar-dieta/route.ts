import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formulario = await request.json();

    console.log("📦 Dados recebidos para gerar dieta:");
    console.log(formulario);

    if (!formulario) {
      return NextResponse.json(
        { erro: "Dados do formulário não foram enviados." },
        { status: 400 }
      );
    }

    const prompt = `
Você é um assistente especializado em planejamento alimentar.

Com base nos dados abaixo, gere uma sugestão de plano alimentar personalizado.

DADOS DO CLIENTE:

Peso: ${formulario.peso}
Altura: ${formulario.altura}
Idade: ${formulario.idade}
Objetivo: ${formulario.objetivo}
Sexo: ${formulario.sexo}
Horário preferido: ${formulario.horario}
Rotina: ${formulario.rotina}
Nível de atividade física: ${formulario.atividade}
Treina: ${formulario.treino}
Observações: ${formulario.observacao || "Nenhuma"}

Alimentos escolhidos pelo cliente:
${
  Array.isArray(formulario.alimentos)
    ? formulario.alimentos.join(", ")
    : "Nenhum informado"
}

Crie uma sugestão de alimentação organizada ao longo do dia.

Para cada refeição informe:
- nome da refeição
- horário
- alimentos
- quantidade aproximada
- observações, quando necessário

Também apresente uma estimativa diária de:
- calorias
- proteínas
- carboidratos
- gorduras

IMPORTANTE:
- Responda em português do Brasil.
- Considere o objetivo informado pelo cliente.
- Priorize os alimentos escolhidos pelo cliente quando forem compatíveis.
- Não invente alergias ou informações que não foram fornecidas.
- Não apresente o plano como diagnóstico ou tratamento médico.
- Retorne SOMENTE JSON válido.
- Não utilize Markdown.
`;

    console.log("🤖 Enviando solicitação para o Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const texto = response.text;

    console.log("🤖 Resposta do Gemini:");
    console.log(texto);

    if (!texto) {
      throw new Error("O Gemini não retornou nenhum conteúdo.");
    }

    let dieta;

    try {
      dieta = JSON.parse(texto);
    } catch (error) {
      console.error("❌ Não foi possível transformar a resposta em JSON.");
      console.error(texto);

      return NextResponse.json(
        {
          erro: "A IA retornou um formato inválido.",
          resposta: texto,
        },
        { status: 500 }
      );
    }

    console.log("✅ DIETA GERADA COM SUCESSO!");

    return NextResponse.json({
      sucesso: true,
      dieta,
    });
  } catch (error) {
    console.error("❌ ERRO AO GERAR DIETA:");
    console.error(error);

    return NextResponse.json(
      {
        sucesso: false,
        erro: "Não foi possível gerar a dieta.",
      },
      { status: 500 }
    );
  }
}