"use client";

import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import GreenHeader from "@/components/layout/GreenHeader";

import QuickActions from "@/components/dashboard/QuickActions";
import ProgressCard from "@/components/dashboard/ProgressCard";
import NextMealCard from "@/components/dashboard/NextMealCard";
import GoalCard from "@/components/dashboard/GoalCard";
import PlanCard from "@/components/dashboard/PlanCard";

import { getUserData } from "@/app/lib/user";


export default function Cliente() {

  const [user, setUser] = useState<any>(null);


  useEffect(() => {

    async function carregarUsuario() {

      const dados = await getUserData();

      setUser(dados);

    }

    carregarUsuario();

  }, []);



  if (!user) {

    return (

      <AppLayout>

        <div className="text-center mt-10">
          Carregando...
        </div>

      </AppLayout>

    );

  }



  return (

    <AppLayout>

      <GreenHeader />


      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 15,
        }}
      >


        <QuickActions />


        <ProgressCard />


        <NextMealCard />


        <GoalCard
          objetivo={user.objetivo}
        />


        <PlanCard
          plano={user.plano}
        />


      </div>


    </AppLayout>

  );

}