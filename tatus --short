import { NextResponse } from "next/server";
import { adminDb } from "@/app/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=================================");
    console.log("WEBHOOK ASAAS RECEBIDO");
    console.log("=================================");
    console.log(JSON.stringify(body, null, 2));

    const evento = body?.event;
    const pagamento = body?.payment;

    if (!evento || !pagamento) {
      return NextResponse.json(
        {
          sucesso: true,
          mensagem: "Webhook recebido, mas sem dados de pagamento.",
        },
        { status: 200 }
      );
    }

    console.log("Evento:", evento);
    console.log("Pagamento:", pagamento);

    /*
     * Estamos interessados principalmente
     * quando o PIX foi efetivamente recebido.
     */
    if (
      evento !== "PAYMENT_RECEIVED" &&
      evento !== "PAYMENT_CONFIRMED"
    ) {
      return NextResponse.json(
        {
          sucesso: true,
          mensagem: "Evento recebido e não processado.",
        },
        { status: 200 }
      );
    }

    const pixQrCodeId = pagamento.pixQrCodeId;

    if (!pixQrCodeId) {
      console.error(
        "Pagamento recebido sem pixQrCodeId."
      );

      return NextResponse.json(
        {
          sucesso: true,
          mensagem: "Pagamento sem pixQrCodeId.",
        },
        { status: 200 }
      );
    }

    /*
     * Procura o pedido que criou esse QR Code.
     */
    const pedidosSnapshot = await adminDb
      .collection("pedidos")
      .where("pixQrCodeId", "==", pixQrCodeId)
      .limit(1)
      .get();

    if (pedidosSnapshot.empty) {
      console.error(
        "Nenhum pedido encontrado para o pixQrCodeId:",
        pixQrCodeId
      );

      return NextResponse.json(
        {
          sucesso: true,
          mensagem: "Pedido não encontrado.",
        },
        { status: 200 }
      );
    }

    const pedidoDoc = pedidosSnapshot.docs[0];

    const pedido = pedidoDoc.data();

    /*
     * Evita processar novamente um pedido já pago.
     */
    if (pedido.status === "pago") {
      console.log(
        "Pedido já estava marcado como pago:",
        pedidoDoc.id
      );

      return NextResponse.json(
        {
          sucesso: true,
          mensagem: "Pedido já processado.",
        },
        { status: 200 }
      );
    }

    /*
     * Atualiza o pedido.
     */
    await pedidoDoc.ref.update({
      status: "pago",

      asaasPaymentId: pagamento.id || null,

      pagamentoConfirmadoEm:
        FieldValue.serverTimestamp(),

      valorPago: pagamento.value || pedido.valor,

      updatedAt:
        FieldValue.serverTimestamp(),
    });

    console.log("=================================");
    console.log("PAGAMENTO CONFIRMADO");
    console.log("=================================");
    console.log({
      pedidoId: pedidoDoc.id,
      uid: pedido.uid,
      email: pedido.email,
      plano: pedido.plano,
      valor: pagamento.value,
      asaasPaymentId: pagamento.id,
    });

    /*
     * Por enquanto apenas marcamos como pago.
     *
     * Depois vamos usar este ponto para:
     *
     * - liberar o produto;
     * - gerar/salvar a dieta;
     * - enviar o acesso;
     * - atualizar a conta do cliente.
     */

    return NextResponse.json(
      {
        sucesso: true,
        pedidoId: pedidoDoc.id,
        status: "pago",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erro no Webhook Asaas:",
      error
    );

    /*
     * Mesmo em alguns erros de processamento,
     * não vamos expor detalhes internos.
     */
    return NextResponse.json(
      {
        erro: true,
        mensagem: "Erro ao processar webhook.",
      },
      { status: 500 }
    );
  }
}