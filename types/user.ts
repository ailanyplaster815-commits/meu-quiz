import { Plano } from "./plano";


export interface UserData {

  uid: string;

  nome: string | null;

  email: string | null;

  foto: string | null;


  objetivo: string;

  peso: string;

  altura: string;

  idade: string;

  sexo: string;

  alimentos: string[];


  plano: Plano;

}