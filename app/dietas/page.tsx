"use client";

import AppLayout from "@/components/layout/AppLayout";
import FeatureGate from "@/components/auth/FeatureGate";


export default function Dietas() {


  return (

    <AppLayout>


      <div className="space-y-5">


        <div className="rounded-3xl bg-white p-6 shadow">


          <h1 className="text-2xl font-bold text-gray-800">
            Minha Dieta
          </h1>


          <p className="mt-2 text-gray-500">
            Plano alimentar personalizado
          </p>


        </div>



        <FeatureGate feature="dieta">


          <div className="rounded-3xl bg-white p-6 shadow">


            <h2 className="text-xl font-bold text-green-600">
              Sua dieta está pronta 🎯
            </h2>


            <p className="mt-3 text-gray-600">
              Aqui aparecerá seu plano alimentar personalizado.
            </p>


          </div>


        </FeatureGate>



        <FeatureGate feature="treino">


          <div className="rounded-3xl bg-white p-6 shadow">


            <h2 className="text-xl font-bold">
              Treinos personalizados 🏋️
            </h2>


            <p className="mt-2 text-gray-500">
              Seus treinos aparecerão aqui.
            </p>


          </div>


        </FeatureGate>



        <FeatureGate feature="receitas">


          <div className="rounded-3xl bg-white p-6 shadow">


            <h2 className="text-xl font-bold">
              Receitas Fitness 🍎
            </h2>


          </div>


        </FeatureGate>



        <FeatureGate feature="ia">


          <div className="rounded-3xl bg-white p-6 shadow">


            <h2 className="text-xl font-bold">
              IA Nutricional 🤖
            </h2>


            <p className="mt-2 text-gray-500">
              Converse com sua assistente nutricional.
            </p>


          </div>


        </FeatureGate>



      </div>


    </AppLayout>

  );

}