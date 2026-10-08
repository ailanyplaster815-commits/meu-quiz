import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/app/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // =========================
    // 1. VALIDAR TOKEN DO ASAAS
    // =========================

    const tokenRecebido = req.headers.get("asaas-access-token");
    const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN;

    if (!tokenEsperado) {
      console.error("❌ ASAAS_WEBHOOK_TOKEN não configurado.");
      return NextResponse.json(
        { erro: "Webhook não configurado." },
        { status: 500 }
      );
    }

    if (!tokenRecebido || tokenRecebido !== tokenEsperado) {
      console.error("❌ Token do webhook inválido.");
      return NextResponse.json(
        { erro: "Não autorizado." },
        { status: 401 }
      );
    }

    // =========================
    // 2. LER EVENTO
    // =========================

    const body = await req.json();

    console.log("🔔 Webhook Asaas recebido:", body.event);

    const eventoId = body.id;
    const evento = body.event;
    const pagamento = body.payment;

    if (!eventoId) {
      console.error("❌ Evento sem ID.");
      return NextResponse.json(
        { erro: "Evento sem ID." },
        { status: 400 }
      );
    }

    // =========================
    // 3. EVITAR PROCESSAMENTO DUPLICADO
    // =========================

    const eventoRef = adminDb.collection("webhook_eventos").doc(eventoId);

    const eventoExistente = await eventoRef.get();

    if (eventoExistente.exists) {
      console.log("ℹ️ Evento já processado:", eventoId);

      return NextResponse.json({
        recebido: true,
        duplicado: true,
      });
    }

    // =========================
    // 4. EVENTOS DE PAGAMENTO
    // =========================

    if (
      evento !== "PAYMENT_RECEIVED" &&
      evento !== "PAYMENT_CONFIRMED"
    ) {
      await eventoRef.set({
        evento,
        processadoEm: FieldValue.serverTimestamp(),
      });

      console.log("ℹ️ Evento ignorado:", evento);

      return NextResponse.json({
        recebido: true,
        ignorado: true,
      });
    }

    if (!pagamento) {
      console.error("❌ Evento sem pagamento.");
      return NextResponse.json(
        { erro: "Pagamento não encontrado." },
        { status: 400 }
      );
    }

    // =========================
    // 5. IDENTIFICAR PEDIDO
    // =========================

    const pixQrCodeId = pagamento.pixQrCodeId;

    if (!pixQrCodeId) {
      console.error("❌ pixQrCodeId não encontrado.");
      return NextResponse.json(
        { erro: "pixQrCodeId não encontrado." },
        { status: 400 }
      );
    }

    const pedidosRef = adminDb
      .collection("pedidos")
      .where("pixQrCodeId", "==", pixQrCodeId)
      .limit(1);

    const pedidosSnapshot = await pedidosRef.get();

    if (pedidosSnapshot.empty) {
      console.error(
        "❌ Pedido não encontrado para pixQrCodeId:",
        pixQrCodeId
      );

      return NextResponse.json(
        { erro: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    const pedidoDoc = pedidosSnapshot.docs[0];

    // =========================
    // 6. MARCAR PEDIDO COMO PAGO
    // =========================

    await pedidoDoc.ref.update({
      status: "pago",
      asaasPaymentId: pagamento.id,
      pagamentoConfirmadoEm: FieldValue.serverTimestamp(),
      valorPago: pagamento.value,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // =========================
    // 7. REGISTRAR EVENTO
    // =========================

    await eventoRef.set({
      evento,
      pagamentoId: pagamento.id,
      pedidoId: pedidoDoc.id,
      processadoEm: FieldValue.serverTimestamp(),
    });

    console.log("✅ Pagamento confirmado:", pagamento.id);
    console.log("✅ Pedido atualizado:", pedidoDoc.id);

    return NextResponse.json({
      recebido: true,
      processado: true,
    });
  } catch (error) {
    console.error("❌ Erro no webhook Asaas:", error);

    return NextResponse.json(
      { erro: "Erro interno no webhook." },
      { status: 500 }
    );
  }
}