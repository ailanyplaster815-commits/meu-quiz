"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UpsellModal from "@/components/UpsellModal";
import UpsellPacote2Modal from "@/components/UpsellPacote2Modal";
import UpsellPacote3Modal from "@/components/UpsellPacote3Modal";

export default function Pacotes() {

  const [objetivo, setObjetivo] = useState("");
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  const [mostrarUpsellPacote1, setMostrarUpsellPacote1] = useState(false);
  const [mostrarUpsellPacote2, setMostrarUpsellPacote2] = useState(false);
  const [mostrarUpsellPacote3, setMostrarUpsellPacote3] = useState(false);

  const router = useRouter();
const irParaCheckout = (plano: string, preco: number, upsell: number = 0) => {
  localStorage.setItem("planoSelecionado", plano);
  localStorage.setItem("precoPlano", preco.toFixed(2));
  localStorage.setItem("valorUpsell", upsell.toFixed(2));

  const valorTotal = preco + upsell;

  localStorage.setItem("precoTotal", valorTotal.toFixed(2));

  router.push("/checkout");
};
  useEffect(() => {
    const valor = localStorage.getItem("objetivo");
    if (valor) {
      setObjetivo(valor);
    }
  }, []);

  return (
    <main
      style={{
  minHeight: "100vh",
  background: "#f5f5f5",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}}
    >
      <div
  style={{
    position: "sticky",
    top: 0,
    width: "100%",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,.05)",
    zIndex: 100,
    padding: "18px 20px",
    marginBottom: 20,
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    }}
  >
    <button
      onClick={() => router.back()}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "#16a329",
        fontWeight: 700,
        fontSize: 15,
      }}
    >
      ← Voltar
    </button>

    <button
  onClick={() => {
    localStorage.setItem("editarObjetivo", "true");
    router.push("/formulario");
  }}
  style={{
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#16a329",
    fontWeight: 700,
    fontSize: 15,
  }}
>
  Mudar objetivo
</button>
</div>

  <h1
    style={{
      margin: 0,
      textAlign: "center",
      color: "#16a329",
      fontSize: 28,
      fontWeight: 800,
    }}
  >
    Escolha seu pacote
  </h1>

  <p
    style={{
      marginTop: 8,
      marginBottom: 0,
      textAlign: "center",
      color: "#666",
    }}
  >
    Selecionamos opções ideais para o seu objetivo
  </p>
</div>

      {objetivo && (
        <div style={{ marginTop: 15, marginBottom: 25, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "#bef9d4",
              color: "#129b00",
              borderRadius: 50,
              border: "1px solid #129b00",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            ✔️ Objetivo: {objetivo}
          </div>
        </div>
      )}

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "100%",
    maxWidth: 420,
  }}
>
        {/* ===================== PACOTE 1 ===================== */}
        <div
          className="anim-card"
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 15,
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <img
            src="/maca-1.png"
            alt="Maçã"
            style={{
              width: "100%",
              height: 110,
              objectFit: "contain",
              borderRadius: 12,
              marginBottom: 12,
            }}
          />

          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "#16a329",
            }}
          >
            Plano {objetivo}
          </h2>

          <p style={{ fontSize: 26, fontWeight: 800, color: "#16a329" }}>
            R$ 9,99
          </p>

          <div
            style={{
              fontSize: 14,
              lineHeight: "22px",
              color: "#333",
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div>✔️ Plano personalizado</div>
            <div>✔️ Gramatura dos Alimentos</div>
            <div>✔️ Acompanhe seu progresso</div>
            <div>✔️ Suporte por email</div>
          </div>

          <div style={{ width: "70%", height: 1, background: "#ddd", margin: "15px auto" }} />

          <button
onClick={() => {
  setPlanoSelecionado("plano_objetivo");
  setMostrarUpsellPacote1(true);
}}
style={{
  width: "70%",
  padding: 12,
  borderRadius: 999,
  background: "#16a329",
  color: "#fff",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
}}
>
Escolher Plano
</button>
        </div>

        {/* ===================== PACOTE 2 ===================== */}
        <div
          className="anim-card"
          style={{
            position: "relative",
            background: "#fff",
            padding: "35px 20px 20px",
            borderRadius: 15,
            border: "3px solid #16a329",
            boxShadow: "0 6px 18px rgba(22,163,41,0.15)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#16a329",
              color: "#fff",
              padding: "6px 18px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ⭐ Mais vendido
          </div>

          <img
            src="/maca-2.png"
            alt="Maçã"
            style={{
              width: "100%",
              borderRadius: 12,
              display: "block",
              margin: "12px auto 16px",
              objectFit: "contain",
            }}
          />

          <h2
            style={{
              color: "#16a329",
              fontWeight: 800,
            }}
          >
            Sua Dieta + Treino
          </h2>

          <p style={{ fontSize: 26, fontWeight: 800, color: "#16a329" }}>
            R$ 14,99
          </p>

          <div
            style={{
              fontSize: 14,
              lineHeight: "22px",
              color: "#333",
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div>✔️ Plano personalizado</div>
            <div>✔️ Plano de treino incluído</div>
            <div>✔️ Treinos em gif</div>
            <div>✔️ Modificar Dieta</div>
            <div>✔️ Receitas Fitness</div>
            <div>✔️ Suporte via WhatsApp</div>
            <div>✔️ Guias de Suplemento</div>
          </div>

          <div style={{ width: "70%", height: 1, background: "#ddd", margin: "15px auto" }} />

          <button
  onClick={() => {
  setPlanoSelecionado("dieta_treino");
  setMostrarUpsellPacote2(true);
}}
  style={{
    width: "70%",
    padding: 12,
    borderRadius: 999,
    background: "#16a329",
    color: "#fff",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  Escolher Plano
</button>
        </div>

        {/* ===================== PACOTE 3 ===================== */}
        <div
          className="anim-card"
          style={{
            position: "relative",
            background: "#fff",
            padding: "35px 20px 20px",
            borderRadius: 15,
            border: "1px solid #16a329",
            boxShadow: "0 6px 18px rgba(22,163,41,0.15)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#16a329",
              color: "#fff",
              padding: "6px 18px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            👤 Indicado
          </div>

          <img
            src="/maca-3.png"
            alt="Maçã"
            style={{
              width: "100%",
              borderRadius: 12,
              display: "block",
              margin: "12px auto 16px",
              objectFit: "contain",
            }}
          />

          <h2 style={{ color: "#16a329", fontWeight: 800 }}>
            Plano Completo
          </h2>

          <p style={{ fontSize: 26, fontWeight: 800, color: "#16a329" }}>
            R$ 15,99
          </p>

          <div
            style={{
              fontSize: 14,
              lineHeight: "22px",
              color: "#333",
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div>✔️ Direito a modificar sua Dieta</div>
            <div>✔️ Treinos em GIFs</div>
            <div>✔️ Receitas Fitness</div>
            <div>✔️ Horário de cada refeição</div>
            <div>✔️ Lista de substituições</div>
            <div>✔️ Recomendações Whey e Creatina</div>
          </div>

          <div style={{ width: "70%", height: 1, background: "#ddd", margin: "15px auto" }} />

          <button
onClick={() => {
  setPlanoSelecionado("plano_completo");
  setMostrarUpsellPacote3(true);
}}
style={{
  width: "70%",
  padding: 12,
  borderRadius: 999,
  background: "#16a329",
  color: "#fff",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
}}
>
Escolher Plano
</button>
</div>

{/* ===================== PACOTE 4 ===================== */}
<div
  className="anim-card"
  style={{
    position: "relative",
    background: "#fff",
    padding: "35px 20px 20px",
    borderRadius: 15,
    border: "1px solid #000",
    boxShadow: "0 6px 18px rgba(22,163,41,0.15)",
    textAlign: "center",
  }}
>
  <div
    style={{
      position: "absolute",
      top: -16,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#000",
      color: "#fff",
      padding: "6px 18px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    Completo
  </div>

  <img
    src="/maca-5.png"
    alt="Maçã"
    style={{
      width: "100%",
      borderRadius: 12,
      display: "block",
      margin: "12px auto 16px",
      objectFit: "contain",
    }}
  />

  <h2 style={{ color: "#16a329", fontWeight: 800 }}>
    Consulta Completa
  </h2>

  <p style={{ fontSize: 26, fontWeight: 800, color: "#16a329" }}>
    R$ 19,99
  </p>

  <div
    style={{
      fontSize: 14,
      lineHeight: "22px",
      color: "#333",
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      alignItems: "center",
      textAlign: "center",
    }}
  >
    <div>✔️ Tudo dos planos anteriores</div>
    <div>✔️ Acompanhamento nutricional</div>
    <div>✔️ Treinos personalizados</div>
    <div>✔️ Consultoria completa</div>
    <div>✔️ Suporte prioritário</div>
  </div>

  <div
    style={{
      width: "70%",
      height: 1,
      background: "#ddd",
      margin: "15px auto",
    }}
  />

  <button
    onClick={() => {
      setPlanoSelecionado("consulta_completa");
    }}
    style={{
      width: "70%",
      padding: 12,
      borderRadius: 999,
      background: "#16a329",
      color: "#fff",
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    Escolher Plano
  </button>
</div> {/* fecha PACOTE 4 */}

</div> {/* fecha container dos pacotes */}

<UpsellModal
  open={mostrarUpsellPacote1}
  plano={planoSelecionado}
  onClose={() => {
    setMostrarUpsellPacote1(false);
    irParaCheckout("plano_objetivo", 9.99, 0);
  }}
  onAccept={() => {
    setMostrarUpsellPacote1(false);
    irParaCheckout("plano_objetivo", 9.99, 5.99);
  }}
/>

<UpsellPacote2Modal
  open={mostrarUpsellPacote2}
  onClose={() => {
    setMostrarUpsellPacote2(false);
    irParaCheckout("dieta_treino", 14.99, 0);
  }}
  onAccept={() => {
    setMostrarUpsellPacote2(false);
    irParaCheckout("dieta_treino", 14.99, 5.99);
  }}
/>

<UpsellPacote3Modal
  open={mostrarUpsellPacote3}
  onClose={() => {
    setMostrarUpsellPacote3(false);
    irParaCheckout("plano_completo", 15.99, 0);
  }}
  onAccept={() => {
    setMostrarUpsellPacote3(false);
    irParaCheckout("plano_completo", 15.99, 2.99);
  }}
/>
    </main>
  );
}
