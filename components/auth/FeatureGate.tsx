"use client";

import { useUser } from "@/hooks/useUser";
import { permissoesPlanos, Feature, Plano } from "@/types/plano";


interface Props {
  feature: Feature;

  children: React.ReactNode;
}


export default function FeatureGate({
  feature,
  children,
}: Props) {


  const { user, loading } = useUser();


  if (loading) {

    return (
      <div className="p-5 text-center">
        Carregando...
      </div>
    );

  }



  if (!user) {

    return null;

  }



const planoAtual: Plano = user.plano || "basico";

  const acesso =
  permissoesPlanos[planoAtual as Plano][feature as Feature];



  if (!acesso) {

    return (

      <div className="rounded-3xl bg-white p-6 shadow text-center">


        <div className="text-4xl">
          🔒
        </div>


        <h2 className="mt-3 text-xl font-bold text-gray-800">

          Faça o Upgrade do seu Plano

        </h2>


        <p className="mt-2 text-gray-500">

          Libere este recurso e aproveite todo o potencial do Seu Nutri.

        </p>


        <button
          className="mt-5 rounded-full bg-green-600 px-6 py-3 text-white font-bold"
        >

          Ver Planos

        </button>


      </div>

    );

  }



  return (
    <>
      {children}
    </>
  );

}