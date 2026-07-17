"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const etapas = [
  "Calculando IMC",
  "Calculando necessidades calóricas",
  "Selecionando alimentos",
  "Montando refeições",
  "Finalizando seu plano",
];

export default function Preparando() {
  const router = useRouter();

  const [progresso, setProgresso] = useState(0);
  const [objetivo, setObjetivo] = useState("");

  useEffect(() => {
    const obj = localStorage.getItem("objetivo");
    if (obj) setObjetivo(obj);
  }, []);

  useEffect(() => {
    let valor = 0;

    const interval = setInterval(() => {
      valor += Math.floor(Math.random() * 6) + 2;

      if (valor >= 100) {
        valor = 100;
      }

      setProgresso(valor);

      if (valor === 100) {
        clearInterval(interval);

        setTimeout(() => {
          router.push("/pacotes");
        }, 900);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [router]);

  const etapaAtual = Math.floor((progresso / 100) * etapas.length);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: 500,
          borderRadius: 20,
          padding: 30,
          boxShadow: "0 8px 30px rgba(0,0,0,.08)",
          textAlign: "center",
        }}
      >
        <img
          src="/maca-4.png"
          alt="Seu Nutri"
          style={{
            width: 130,
            margin: "0 auto 20px",
            animation: "pulse 2s infinite",
          }}
        />

        <h1
          style={{
            color: "#16a329",
            fontSize: 30,
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          Montando sua dieta
        </h1>

        <p
          style={{
            color: "#666",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          Estamos criando um plano alimentar exclusivo para você.
        </p>

        {objetivo && (
          <div
            style={{
              display: "inline-block",
              background: "#e8f8ec",
              color: "#16a329",
              border: "1px solid #16a329",
              borderRadius: 999,
              padding: "10px 18px",
              fontWeight: 700,
              marginBottom: 30,
            }}
          >
            🎯 Objetivo: {objetivo}
          </div>
        )}

        <div
          style={{
            width: "100%",
            height: 14,
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: `${progresso}%`,
              height: "100%",
              background: "#16a329",
              transition: "0.3s",
            }}
          />
        </div>

        <div
          style={{
            color: "#16a329",
            fontWeight: 800,
            fontSize: 20,
            marginBottom: 30,
          }}
        >
          {progresso}%
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15,
            textAlign: "left",
          }}
        >
          {etapas.map((etapa, index) => {
            let icone = "○";

            if (index < etapaAtual) icone = "✔️";
            else if (index === etapaAtual && progresso < 100) icone = "⏳";

            return (
              <div
                key={etapa}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 16,
                  color:
                    index <= etapaAtual ? "#222" : "#999",
                  fontWeight:
                    index === etapaAtual ? 700 : 500,
                }}
              >
                <span>{icone}</span>
                <span>{etapa}</span>
              </div>
            );
          })}
        </div>

        {progresso === 100 && (
          <div
            style={{
              marginTop: 35,
              padding: 15,
              background: "#e8f8ec",
              borderRadius: 12,
              color: "#16a329",
              fontWeight: 700,
            }}
          >
            🎉 Sua dieta ficou pronta! Redirecionando...
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </main>
  );
}