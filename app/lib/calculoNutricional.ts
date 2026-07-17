import type { QuizData } from "@/types/quiz";

export function calcularDieta(dados: QuizData) {
  const peso = Number(dados.peso);
  const altura = Number(dados.altura);
  const idade = Number(dados.idade);

  // Taxa Metabólica Basal (Mifflin-St Jeor)
  let tmb = 0;

  if (dados.sexo === "masculino") {
    tmb = 10 * peso + 6.25 * altura - 5 * idade + 5;
  } else {
    tmb = 10 * peso + 6.25 * altura - 5 * idade - 161;
  }

  // Multiplicador de atividade
  let fator = 1.2;

  switch (dados.atividade) {
    case "Baixa":
      fator = 1.35;
      break;

    case "Média":
      fator = 1.55;
      break;

    case "Alta":
      fator = 1.75;
      break;
  }

  let calorias = tmb * fator;

  // Ajuste pelo objetivo
  switch (dados.objetivo) {
    case "Perder peso":
      calorias -= 400;
      break;

    case "Ganhar massa muscular":
      calorias += 300;
      break;

    case "Manter boa forma":
      break;
  }

  // Proteína
  let proteina = 2 * peso;

  if (dados.objetivo === "Perder peso") {
    proteina = 2.2 * peso;
  }

  // Gordura
  const gordura = peso * 0.8;

  // Carboidrato
  const carboidrato =
    (calorias - proteina * 4 - gordura * 9) / 4;

  return {
    calorias: Math.round(calorias),
    proteina: Math.round(proteina),
    gordura: Math.round(gordura),
    carboidrato: Math.round(carboidrato),
  };
}