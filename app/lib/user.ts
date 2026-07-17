import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { db } from "./firebase";
import { UserData } from "@/types/user";


export async function getUserData(): Promise<UserData | null> {

  const auth = getAuth();

  const user = auth.currentUser;


  if (!user) {
    return null;
  }


  const quizRef = doc(
    db,
    "quizzes",
    user.uid
  );


  const quizSnap = await getDoc(quizRef);



  if (!quizSnap.exists()) {

    return null;

  }



  const dados = quizSnap.data();



  return {

    uid: user.uid,

    nome: user.displayName,

    email: user.email,

    foto: user.photoURL,


    objetivo: dados.objetivo || "",

    peso: dados.peso || "",

    altura: dados.altura || "",

    idade: dados.idade || "",

    sexo: dados.sexo || "",

    alimentos: dados.alimentos || [],


    plano: dados.plano || "basico",

  };

}