"use client";

import { Check } from "lucide-react";

interface UpsellModalProps {
  open: boolean;
  plano: string;
  onClose: () => void;
  onAccept: () => void;
}

const benefits = [
  "Treinos personalizados",
  "Recomendação Whey",
  "Recomendação Creatina",
  "Receitas fit",
  "Lista de substituições",
];

export default function UpsellModal({
  open,
  plano,
  onClose,
  onAccept,
}: UpsellModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-950/75 backdrop-blur-md px-4">
      <div
        className="
          w-full
          max-w-[360px]
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
        "
      >
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-black">
            Aprimore seu plano {plano}
          </h2>

          <p className="mt-2 text-[15px] text-gray-500">
            Por apenas{" "}
            <span className="font-semibold text-green-600">
              R$ 5,99
            </span>{" "}
            a mais
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-3"
            >
              <div
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-green-100
                "
              >
                <Check
                  size={14}
                  className="text-green-600"
                  strokeWidth={3}
                />
              </div>

              <span className="text-[15px] text-gray-700">
                {benefit}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="
              h-11
              flex-1
              rounded-full
              border
              border-gray-300
              bg-white
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-50
            "
          >
            Não, obrigado
          </button>

          <button
            onClick={onAccept}
            className="
              h-11
              flex-1
              rounded-full
              bg-green-600
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-green-700
            "
          >
            Sim, quero!
          </button>
        </div>
      </div>
    </div>
  );
}