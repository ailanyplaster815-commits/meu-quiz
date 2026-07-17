export type Plano =
  | "basico"
  | "dieta_treino"
  | "completo"
  | "consulta";


export type Feature =
  | "dieta"
  | "treino"
  | "receitas"
  | "ia"
  | "suporteWhatsapp";


export const permissoesPlanos: Record<
  Plano,
  Record<Feature, boolean>
> = {

  basico: {
    dieta: true,
    treino: false,
    receitas: false,
    ia: false,
    suporteWhatsapp: false,
  },


  dieta_treino: {
    dieta: true,
    treino: true,
    receitas: true,
    ia: false,
    suporteWhatsapp: true,
  },


  completo: {
    dieta: true,
    treino: true,
    receitas: true,
    ia: false,
    suporteWhatsapp: true,
  },


  consulta: {
    dieta: true,
    treino: true,
    receitas: true,
    ia: true,
    suporteWhatsapp: true,
  }

};