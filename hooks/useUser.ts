"use client";

import { useEffect, useState } from "react";
import { getUserData } from "@/app/lib/user";

export function useUser() {

  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function carregarUsuario() {

      const dados = await getUserData();

      setUser(dados);

      setLoading(false);

    }


    carregarUsuario();

  }, []);


  return {
    user,
    loading,
  };

}