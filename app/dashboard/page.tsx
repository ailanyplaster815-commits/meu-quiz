"use client";

import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";

import QuickActions from "@/components/dashboard/QuickActions";
import ProgressCard from "@/components/dashboard/ProgressCard";
import NextMealCard from "@/components/dashboard/NextMealCard";
import GoalCard from "@/components/dashboard/GoalCard";
import PlanCard from "@/components/dashboard/PlanCard";

import { getUserData } from "@/app/lib/user";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function carregar() {
      const dados = await getUserData();
      setUser(dados);
    }

    carregar();
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

      <QuickActions />

      <ProgressCard />

      <NextMealCard />

      <GoalCard objetivo={user.objetivo} />

      <PlanCard plano="Essencial" />

    </AppLayout>
  );
}