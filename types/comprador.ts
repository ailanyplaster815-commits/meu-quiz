export type Plano =
  | "plano_objetivo"
  | "dieta_treino"
  | "plano_completo"
  | "consulta_completa";


export interface Comprador {

  uid:string;

  nome:string;

  email:string;

  objetivo:string;

  idade:number;

  peso:number;

  altura:number;

  sexo:string;

  atividade:string;

  treino:string;


  plano: Plano;

  pagamento:boolean;

}