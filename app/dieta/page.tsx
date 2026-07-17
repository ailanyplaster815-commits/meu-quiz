"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { calcularDieta } from "../lib/calculoNutricional";
import type { QuizData } from "@/types/quiz";
import { gerarDieta } from "../lib/geradorDieta";
export default function Dieta() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState<any>(null);
  const [dieta, setDieta] = useState<any>(null);
  const [nutricao, setNutricao] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {

      if (!user) {
        router.push("/");
        return;
      }

      const ref = doc(db, "compradores", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Você ainda não possui acesso à dieta.");
        router.push("/pacotes");
        return;
      }

      const comprador = snap.data() as QuizData;

setDados(comprador);

const resultado = calcularDieta(comprador);

setNutricao(resultado);


// gera a dieta
const dietaGerada = gerarDieta({
  ...comprador,
  ...resultado
});

setDieta(dietaGerada);


setCarregando(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (carregando) {
    return <h2>Carregando sua dieta...</h2>;
  }

  return (
    <main style={{ padding: 30 }}>

      <h1>Sua Dieta</h1>

      <hr />

      <p><strong>Nome:</strong> {dados.nome}</p>

      <p><strong>Objetivo:</strong> {dados.objetivo}</p>

      <p><strong>Peso:</strong> {dados.peso} kg</p>

      <p><strong>Altura:</strong> {dados.altura} cm</p>

      <p><strong>Idade:</strong> {dados.idade}</p>

      <p><strong>Sexo:</strong> {dados.sexo}</p>

      <p><strong>Rotina:</strong> {dados.rotina}</p>

      <p><strong>Atividade:</strong> {dados.atividade}</p>

      <p><strong>Treino:</strong> {dados.treino}</p>

<hr />

<h2>
Sua dieta personalizada 🍽️
</h2>


<p>
Calorias planejadas: {dieta?.calorias} kcal
</p>


{dieta?.refeicoes.map((refeicao:any, index:number) => (

  <div key={index}>

    <h3>
      {refeicao.titulo}
    </h3>

    <ul>
      {refeicao.alimentos.map(
        (alimento:string, i:number)=>(
          <li key={i}>
            {alimento}
          </li>
        )
      )}
    </ul>

  </div>

))}
      <hr />

<h2>Necessidades Nutricionais</h2>

<p>
  <strong>Calorias:</strong> {nutricao?.calorias} kcal
</p>

<p>
  <strong>Proteínas:</strong> {nutricao?.proteina} g
</p>

<p>
  <strong>Carboidratos:</strong> {nutricao?.carboidrato} g
</p>

<p>
  <strong>Gorduras:</strong> {nutricao?.gordura} g
</p>

      <ul>
        {dados.alimentos?.map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

    </main>
  );
}