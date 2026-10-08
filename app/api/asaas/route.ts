import { NextResponse } from "next/server";
import { adminDb } from "@/app/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const ASAAS_API = "https://api.asaas.com/v3";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiKey = process.env.ASAAS_API_KEY;
    const pixKey = process.env.ASAAS_PIX_KEY;

    // Identificação do usuário
    const uid = body.uid;
    const email = body.email;

    if (!uid) {
      return NextResponse.json(
        {
          erro: true,
          mensagem: "Usuário não identificado.",
        },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          erro: true,
          mensagem: "ASAAS_API_KEY não encontrada.",
        },
        { status: 500 }
      );
    }

    if (!pixKey) {
      return NextResponse.json(
        {
          erro: true,
          mensagem: "ASAAS_PIX_KEY não encontrada.",
        },
        { status: 500 }
      );
    }

    const valor = Number(body.valor);

    if (!valor || valor <= 0) {
      return NextResponse.json(
        {
          erro: true,
          mensagem: "Valor inválido.",
        },
        { status: 400 }
      );
    }

    /*
     * Identificador único deste pedido.
     */
    const pedidoId = `PED_${crypto.randomUUID()}`;
    await adminDb.collection("pedidos").doc(pedidoId).set({
  uid,
  email: email || null,
  plano: body.plano || null,
  valor,
  status: "pendente",
  externalReference: pedidoId,
  createdAt: FieldValue.serverTimestamp(),
});

    console.log("Pedido criado:", {
      pedidoId,
      uid,
      email,
      plano: body.plano,
      valor,
    });

    const resposta = await fetch(
      `${ASAAS_API}/pix/qrCodes/static`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          access_token: apiKey,
        },
        body: JSON.stringify({
          addressKey: pixKey,
          description: `Seu Nutri - ${body.plano || "Plano personalizado"}`,
          value: valor,
          format: "ALL",
          allowsMultiplePayments: false,
          externalReference: pedidoId,
        }),
      }
    );

    const texto = await resposta.text();

    let dados;

    try {
      dados = JSON.parse(texto);
    } catch {
      dados = {
        resposta: texto,
      };
    }

    if (!resposta.ok) {
      console.error("Erro Asaas:", dados);

      return NextResponse.json(
        {
          erro: true,
          mensagem:
            dados?.errors?.[0]?.description ||
            dados?.mensagem ||
            "Não foi possível criar o QR Code PIX.",
          detalhes: dados,
        },
        { status: resposta.status }
      );
    }

    console.log("QR Code PIX criado:", dados);

    return NextResponse.json({
      sucesso: true,

      // Identificação do pedido
      pedidoId,

      // Identificação do usuário
      uid,

      pix: {
        id: dados.id,
        payload: dados.payload,
        encodedImage: dados.encodedImage,
      },

      valor,
      plano: body.plano || null,
    });
  } catch (error) {
    console.error("Erro interno:", error);

    return NextResponse.json(
      {
        erro: true,
        mensagem: "Erro interno ao criar o pagamento.",
      },
      { status: 500 }
    );
  }
}