
import { NextRequest, NextResponse } from "next/server";
import {
  FieldValue,
  type DocumentReference,
  type DocumentData,
} from "firebase-admin/firestore";
import { adminDb } from "@/app/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // 1. IDENTIFICAR O AMBIENTE PELO TOKEN

    const tokenRecebido = req.headers.get("asaas-access-token");

    const tokenProducao = process.env.ASAAS_WEBHOOK_TOKEN;
    const tokenSandbox = process.env.ASAAS_WEBHOOK_TOKEN_SANDBOX;

    let ambienteWebhook: "producao" | "sandbox" | null = null;

    if (tokenRecebido && tokenProducao && tokenRecebido === tokenProducao) {
      ambienteWebhook = "producao";
    } else if (
      tokenRecebido &&
      tokenSandbox &&
      tokenRecebido === tokenSandbox
    ) {
      ambienteWebhook = "sandbox";
    }

    if (!ambienteWebhook) {
      return NextResponse.json(
        { erro: "Não autorizado." },
        { status: 401 }
      );
    }

    // 2. LER EVENTO

    const body = await req.json();

    const eventoId = String(body?.id || "");
    const evento = String(body?.event || "");
    const pagamento = body?.payment;

    if (!eventoId) {
      return NextResponse.json(
        { erro: "Evento sem ID." },
        { status: 400 }
      );
    }

    const eventoRef = adminDb.collection("webhook_eventos").doc(eventoId);

    // 3. REGISTRAR EVENTOS QUE NÃO LIBERAM A DIETA

    const eventosValidos = [
      "PAYMENT_RECEIVED",
      "PAYMENT_CONFIRMED",
    ];

    if (ambienteWebhook === "sandbox" || !eventosValidos.includes(evento)) {
      const resultado = await adminDb.runTransaction(async (tx) => {
        const existente = await tx.get(eventoRef);

        if (existente.exists) {
          return "duplicado";
        }

        tx.set(eventoRef, {
          evento,
          ambiente: ambienteWebhook,
          ignorado: true,
          processadoEm: FieldValue.serverTimestamp(),
        });

        return "ignorado";
      });

      return NextResponse.json({
        recebido: true,
        [resultado]: true,
      });
    }

    // 4. VALIDAR PAGAMENTO

    if (!pagamento?.id) {
      return NextResponse.json(
        { erro: "Pagamento sem identificador." },
        { status: 400 }
      );
    }

    if (
      pagamento.status !== "CONFIRMED" &&
      pagamento.status !== "RECEIVED"
    ) {
      return NextResponse.json(
        { erro: "Pagamento ainda não confirmado." },
        { status: 400 }
      );
    }

    const valorPagamento = Number(pagamento.value);

    if (!Number.isFinite(valorPagamento)) {
      return NextResponse.json(
        { erro: "Valor do pagamento inválido." },
        { status: 400 }
      );
    }

    // 5. LOCALIZAR O PEDIDO

    const externalReference = String(
      pagamento.externalReference || ""
    ).trim();

    const pixQrCodeId = String(
      pagamento.pixQrCodeId || ""
    ).trim();

    let pedidoRef: DocumentReference<DocumentData> | null = null;

    if (externalReference) {
      const tentativa = adminDb
        .collection("pedidos")
        .doc(externalReference);

      const documento = await tentativa.get();

      if (documento.exists) {
        pedidoRef = tentativa;
      }
    }

    // Compatibilidade com pedidos localizados pelo QR Code

    if (!pedidoRef && pixQrCodeId) {
      const consulta = await adminDb
        .collection("pedidos")
        .where("pixQrCodeId", "==", pixQrCodeId)
        .limit(1)
        .get();

      if (!consulta.empty) {
        pedidoRef = consulta.docs[0].ref;
      }
    }

    if (!pedidoRef) {
      return NextResponse.json(
        { erro: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    // 6. CONFIRMAR PEDIDO E LIBERAR A DIETA
    // Tudo acontece em uma transação do Firestore.

    const resultado = await adminDb.runTransaction(async (tx) => {
      const eventoExistente = await tx.get(eventoRef);

      if (eventoExistente.exists) {
        return "duplicado";
      }

      const pedidoSnap = await tx.get(pedidoRef!);

      if (!pedidoSnap.exists) {
        return "pedido_nao_encontrado";
      }

      const pedido = pedidoSnap.data()!;

      // Pedido de Sandbox nunca libera a dieta.

      if (pedido.ambiente === "sandbox") {
        tx.set(eventoRef, {
          evento,
          pagamentoId: pagamento.id,
          pedidoId: pedidoSnap.id,
          ambiente: "sandbox",
          ignorado: true,
          processadoEm: FieldValue.serverTimestamp(),
        });

        return "sandbox_ignorado";
      }

      // Se o ambiente estiver ausente, a autenticação
      // pelo token de produção permite compatibilidade
      // com pedidos antigos.

      if (
        pedido.ambiente &&
        pedido.ambiente !== "producao"
      ) {
        return "ambiente_invalido";
      }

      // Conferir se o valor recebido corresponde ao pedido.

      const valorPedidoCentavos = Math.round(
        Number(pedido.valor) * 100
      );

      const valorRecebidoCentavos = Math.round(
        valorPagamento * 100
      );

      if (
        !Number.isFinite(valorPedidoCentavos) ||
        valorPedidoCentavos !== valorRecebidoCentavos
      ) {
        tx.update(pedidoRef!, {
          status: "divergencia_pagamento",
          valorRecebido: valorPagamento,
          updatedAt: FieldValue.serverTimestamp(),
        });

        tx.set(eventoRef, {
          evento,
          pagamentoId: pagamento.id,
          pedidoId: pedidoSnap.id,
          ambiente: "producao",
          divergencia: true,
          processadoEm: FieldValue.serverTimestamp(),
        });

        return "valor_divergente";
      }

      if (!pedido.uid) {
        return "usuario_nao_encontrado";
      }

      // Buscar os dados originais do questionário.

      const quizRef = adminDb
        .collection("quizzes")
        .doc(pedido.uid);

      const quizSnap = await tx.get(quizRef);

      if (!quizSnap.exists) {
        return "questionario_nao_encontrado";
      }

      const dadosQuiz = quizSnap.data()!;

      // Atualizar pedido.

      tx.update(pedidoRef!, {
        status: "pago",
        asaasPaymentId: pagamento.id,
        pagamentoConfirmadoEm: FieldValue.serverTimestamp(),
        valorPago: valorPagamento,
        ambiente: "producao",
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Criar comprador com os dados do questionário.
      // Este documento libera o acesso à página da dieta.

      const compradorRef = adminDb
        .collection("compradores")
        .doc(pedido.uid);

      tx.set(
        compradorRef,
        {
          ...dadosQuiz,
          uid: pedido.uid,
          email: pedido.email || dadosQuiz.email || "",
          status: "ativo",
          pagamentoStatus: "pago",
          pedidoId: pedidoSnap.id,
          plano: pedido.plano,
          valorPago: valorPagamento,
          ambiente: "producao",
          liberadoEm: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Registrar evento processado.

      tx.set(eventoRef, {
        evento,
        pagamentoId: pagamento.id,
        pedidoId: pedidoSnap.id,
        ambiente: "producao",
        processadoEm: FieldValue.serverTimestamp(),
      });

      return "pago";
    });

    // 7. RESPONDER AO ASAAS

    if (resultado === "duplicado") {
      return NextResponse.json({
        recebido: true,
        duplicado: true,
      });
    }

    if (resultado === "questionario_nao_encontrado") {
      return NextResponse.json(
        { erro: "Questionário do usuário não encontrado." },
        { status: 409 }
      );
    }

    if (resultado === "valor_divergente") {
      return NextResponse.json(
        { erro: "O valor recebido não corresponde ao pedido." },
        { status: 409 }
      );
    }

    if (resultado !== "pago") {
      return NextResponse.json(
        { erro: "Não foi possível confirmar o pedido." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      recebido: true,
      processado: true,
      dietaLiberada: true,
    });

  } catch {
    console.error("Erro interno ao processar webhook Asaas.");

    return NextResponse.json(
      { erro: "Erro interno no webhook." },
      { status: 500 }
    );
  }
}
