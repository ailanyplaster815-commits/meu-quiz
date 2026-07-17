"use client";

import AppLayout from "@/components/layout/AppLayout";

import GreenHeader from "@/components/layout/GreenHeader";

import QuickActions from "@/components/dashboard/QuickActions";
import ProgressCard from "@/components/dashboard/ProgressCard";
import NextMealCard from "@/components/dashboard/NextMealCard";
import GoalCard from "@/components/dashboard/GoalCard";
import PlanCard from "@/components/dashboard/PlanCard";


export default function Cliente() {


  return (

    <AppLayout>

      <GreenHeader />


      <div
        style={{
          padding:20,
          display:"flex",
          flexDirection:"column",
          gap:15
        }}
      >


        <QuickActions />


        <ProgressCard />


        <NextMealCard />


        <GoalCard />


        <PlanCard />


      </div>


    </AppLayout>

  );

}