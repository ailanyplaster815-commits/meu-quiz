import { NextResponse } from "next/server";
import { adminDb } from "@/app/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const ASAAS_API = "https://api.asaas.com/v3";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiKey = process.env.ASAAS_API_KEY;
    const pixKey = process.env.ASAAS_PIX_KEY;

    // =========================
    // DADOS RECEBIDOS
    // =========================

    const uid = body.uid;
    const email = body.email;
    const plano = body.plano;
    const pagamento = body.pagamento;
    const valor = Number(body.valor);

    // =========================
    // VALIDAÇÕES
    // =========================

    if (!uid) {
      return NextResponse.json(
        {
          erro: true,
          mensagem: "Usuário não identificado.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          erro: true,
          mensagem: "E-mail não informado.",
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

    if (!valor || valor <= 0) {
      return NextResponse.json(
        {
          erro: true,
          mensagem: "Valor inválido.",
        },
        { status: 400 }
      );
    }

    if (pagamento !== "pix") {
      return NextResponse.json(
        {
          erro: true,
          mensagem:
            "Neste momento, somente o pagamento via PIX está disponível.",
        },
        { status: 400 }
      );
    }

    // =========================
    // PEDIDO
    // =========================

    const pedidoId = `PED_${crypto.randomUUID()}`;

    await adminDb
      .collection("pedidos")
      .doc(pedidoId)
      .set({
        uid,
        email,
        plano: plano || null,
        valor,
        pagamento: "pix",

        status: "pendente",

        externalReference: pedidoId,

        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    console.log("=================================");
    console.log("PEDIDO CRIADO");
    console.log("=================================");
    console.log({
      pedidoId,
      uid,
      email,
      plano,
      valor,
      pagamento,
    });

    // =========================
    // CRIAR QR CODE PIX
    // =========================

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

          description: `Seu Nutri - ${
            plano || "Plano personalizado"
          }`,

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

    // =========================
    // ERRO ASAAS
    // =========================

    if (!resposta.ok) {
      console.error("=================================");
      console.error("ERRO ASAAS");
      console.error("=================================");
      console.error(dados);

      await adminDb
        .collection("pedidos")
        .doc(pedidoId)
        .update({
          status: "erro",
          erroAsaas: dados,
          updatedAt: FieldValue.serverTimestamp(),
        });

      return NextResponse.json(
        {
          erro: true,

          mensagem:
            dados?.errors?.[0]?.description ||
            dados?.mensagem ||
            "Não foi possível criar o QR Code PIX.",

          detalhes: dados,
        },
        {
          status: resposta.status,
        }
      );
    }

    // =========================
    // QR CODE CRIADO
    // =========================

    console.log("=================================");
    console.log("QR CODE PIX CRIADO");
    console.log("=================================");
    console.log(dados);

    // =========================
    // ATUALIZA PEDIDO
    // =========================

    await adminDb
      .collection("pedidos")
      .doc(pedidoId)
      .update({
        pixQrCodeId: dados.id || null,

        pixPayload: dados.payload || null,

        status: "pix_gerado",

        updatedAt: FieldValue.serverTimestamp(),
      });

    // =========================
    // RESPOSTA PARA O CHECKOUT
    // =========================

    return NextResponse.json({
      sucesso: true,

      pedidoId,

      uid,

      valor,

      plano: plano || null,

      pix: {
        id: dados.id,
        payload: dados.payload,
        encodedImage: dados.encodedImage,
      },
    });
  } catch (error) {
    console.error("=================================");
    console.error("ERRO INTERNO");
    console.error("=================================");
    console.error(error);

    return NextResponse.json(
      {
        erro: true,
        mensagem: "Erro interno ao criar o pagamento.",
      },
      {
        status: 500,
      }
    );
  }
}