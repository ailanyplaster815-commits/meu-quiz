"use client";

import Image from "next/image";
import { useUser } from "@/hooks/useUser";

export default function GreenHeader() {

  const { user, loading } = useUser();

  const hora = new Date().getHours();

  let saudacao = "Boa noite 🌙";

  if (hora >= 5 && hora < 12) {
    saudacao = "Bom dia ☀️";
  } else if (hora >= 12 && hora < 18) {
    saudacao = "Boa tarde 🌤";
  }


  return (
    <div className="relative overflow-hidden rounded-b-[35px] bg-gradient-to-b from-green-700 via-green-600 to-green-500 px-6 pt-10 pb-8 text-white">


      {/* Maçã decorativa */}
      <Image
        src="/maca-4.png"
        alt="Maçã"
        width={180}
        height={180}
        className="absolute -right-10 top-4 opacity-10"
      />


      <div className="relative z-10">


        <div className="flex items-center justify-between">


          <div className="flex items-center gap-3">


            <Image
              src="/maca-4.png"
              alt="Logo"
              width={50}
              height={50}
            />


            <div>

              <h1 className="text-2xl font-bold">
                Seu Nutri
              </h1>


              <p className="text-sm opacity-80">
                Sua alimentação inteligente
              </p>


            </div>


          </div>



          {/* Foto do usuário */}
          {
            user?.foto && (

              <Image
                src={user.foto}
                alt="Foto usuário"
                width={50}
                height={50}
                className="rounded-full border-2 border-white"
              />

            )
          }


        </div>



        <div className="mt-8">


          <p className="text-lg">
            {saudacao}
          </p>



          <h2 className="text-3xl font-bold mt-1">

            {
              loading
                ? "Carregando..."
                : `${user?.nome || "Usuário"} 👋`
            }

          </h2>



          <p className="mt-2 opacity-90">
            Hoje é um ótimo dia para cuidar da sua alimentação.
          </p>



          {/* Objetivo do usuário */}

          {
            user?.objetivo && (

              <div
                className="mt-4 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold"
              >

                🎯 {user.objetivo}

              </div>

            )
          }


        </div>


      </div>


    </div>
  );
}