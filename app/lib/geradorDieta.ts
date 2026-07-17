export type Refeicao = {
  titulo: string;
  alimentos: string[];
};

export type Dieta = {
  calorias: number;
  refeicoes: Refeicao[];
};

export function gerarDieta(dados: any): Dieta {

  const refeicoes: Refeicao[] = [];

  if (dados.objetivo === "Ganhar massa muscular") {

    refeicoes.push({
      titulo: "Café da manhã",
      alimentos: [
        "2 ovos",
        "2 fatias de pão integral",
        "1 banana"
      ]
    });

    refeicoes.push({
      titulo: "Almoço",
      alimentos: [
        "150g arroz",
        "150g frango",
        "Salada"
      ]
    });

    refeicoes.push({
      titulo: "Lanche",
      alimentos: [
        "Iogurte",
        "Aveia"
      ]
    });

    refeicoes.push({
      titulo: "Jantar",
      alimentos: [
        "150g carne",
        "Batata-doce",
        "Legumes"
      ]
    });

    return {
      calorias: 2800,
      refeicoes
    };

  }

  if (dados.objetivo === "Perder peso") {

    refeicoes.push({
      titulo: "Café da manhã",
      alimentos: [
        "Omelete",
        "Café sem açúcar"
      ]
    });

    refeicoes.push({
      titulo: "Almoço",
      alimentos: [
        "100g frango",
        "Salada",
        "100g arroz"
      ]
    });

    refeicoes.push({
      titulo: "Jantar",
      alimentos: [
        "Peixe",
        "Legumes"
      ]
    });

    return {
      calorias: 1800,
      refeicoes
    };

  }

  return {
    calorias: 2200,
    refeicoes: []
  };

}