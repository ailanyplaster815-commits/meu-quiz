
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/app/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const ASAAS_API = "https://api.asaas.com/v3";

// Preços definidos no servidor
const PLANOS: Record<
  string,
  { valor: number; upsells: number[] }
> = {
  plano_objetivo: { valor: 9.99, upsells: [0, 5.99] },
  dieta_treino: { valor: 14.99, upsells: [0, 5.99] },
  plano_completo: { valor: 15.99, upsells: [0, 2.99] },
  consulta_completa: { valor: 19.99, upsells: [0] },
};

export async function POST(request: Request) {
  try {
    // 1. VALIDAR AUTENTICAÇÃO FIREBASE

    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.substring(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { erro: true, mensagem: "Autenticação necessária." },
        { status: 401 }
      );
    }

    let usuario;

    try {
      usuario = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { erro: true, mensagem: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const uid = usuario.uid;
    const email = String(body.email || "").trim().toLowerCase();
    const plano = String(body.plano || "");
    const pagamento = body.pagamento;

    if (body.uid && body.uid !== uid) {
      return NextResponse.json(
        { erro: true, mensagem: "Usuário inválido." },
        { status: 403 }
      );
    }

    // 2. VALIDAR DADOS

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { erro: true, mensagem: "E-mail inválido." },
        { status: 400 }
      );
    }

    if (pagamento !== "pix") {
      return NextResponse.json(
        { erro: true, mensagem: "Pagamento por cartão será habilitado na próxima etapa." },
        { status: 400 }
      );
    }

    const configuracaoPlano = PLANOS[plano];

    if (!configuracaoPlano) {
      return NextResponse.json(
        { erro: true, mensagem: "Plano inválido." },
        { status: 400 }
      );
    }

    // 3. CALCULAR PREÇO NO SERVIDOR

    const valorUpsellCentavos = Math.round(
      Number(body.valorUpsell ?? 0) * 100
    );

    const upsellsPermitidos = configuracaoPlano.upsells.map(
      (valor) => Math.round(valor * 100)
    );

    if (
      !Number.isFinite(valorUpsellCentavos) ||
      !upsellsPermitidos.includes(valorUpsellCentavos)
    ) {
      return NextResponse.json(
        { erro: true, mensagem: "Adicional inválido." },
        { status: 400 }
      );
    }

    const valorCentavos =
      Math.round(configuracaoPlano.valor * 100) +
      valorUpsellCentavos;

    const valor = valorCentavos / 100;

    // 4. VALIDAR CONFIGURAÇÃO ASAAS

    const apiKey = process.env.ASAAS_API_KEY;
    const pixKey = process.env.ASAAS_PIX_KEY;

    if (!apiKey || !pixKey) {
      console.error("Configuração do PIX não encontrada.");

      return NextResponse.json(
        { erro: true, mensagem: "Configuração do pagamento indisponível." },
        { status: 500 }
      );
    }

    // PIX permanece em PRODUÇÃO

    const ambiente = "producao";

    // 5. CRIAR PEDIDO

    const pedidoId = `PED_${crypto.randomUUID()}`;

    const pedidoRef = adminDb.collection("pedidos").doc(pedidoId);

    await pedidoRef.set({
      uid,
      email,
      plano,
      valor,
      valorUpsell: valorUpsellCentavos / 100,
      pagamento: "pix",
      ambiente,
      status: "pendente",
      externalReference: pedidoId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 6. GERAR QR CODE PIX

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
          description: `Seu Nutri - ${plano}`,
          value: valor,
          format: "ALL",
          allowsMultiplePayments: false,
          externalReference: pedidoId,
        }),
      }
    );

    const texto = await resposta.text();

    let dados: any;

    try {
      dados = JSON.parse(texto);
    } catch {
      dados = {};
    }

    // 7. TRATAR ERRO ASAAS

    if (!resposta.ok) {
      const mensagem =
        dados?.errors?.[0]?.description ||
        dados?.mensagem ||
        "Não foi possível criar o QR Code PIX.";

      await pedidoRef.update({
        status: "erro",
        erroAsaas: mensagem,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        { erro: true, mensagem },
        { status: resposta.status }
      );
    }

    // 8. ATUALIZAR PEDIDO

    await pedidoRef.update({
      pixQrCodeId: dados.id || null,
      pixPayload: dados.payload || null,
      status: "pix_gerado",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 9. RETORNAR PIX AO CHECKOUT

    return NextResponse.json({
      sucesso: true,
      pedidoId,
      uid,
      valor,
      plano,
      pix: {
        id: dados.id,
        payload: dados.payload,
        encodedImage: dados.encodedImage,
      },
    });

  } catch (error) {
    console.error("Erro interno ao criar pagamento PIX.");

    return NextResponse.json(
      {
        erro: true,
        mensagem: "Erro interno ao criar o pagamento.",
      },
      { status: 500 }
    );
  }
}
