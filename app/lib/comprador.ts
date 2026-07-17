import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";


export async function criarComprador(uid: string) {

  const quizRef = doc(
    db,
    "quizzes",
    uid
  );


  const quizSnap = await getDoc(
    quizRef
  );


  if (!quizSnap.exists()) {
    throw new Error(
      "Quiz não encontrado"
    );
  }


  const dadosQuiz = quizSnap.data();


  await setDoc(
    doc(
      db,
      "compradores",
      uid
    ),
    {
      ...dadosQuiz,

      status: "ativo",

      plano: "Plano Completo",

      createdAt: new Date(),

    },
    {
      merge:true
    }
  );


  console.log(
    "Comprador criado com sucesso"
  );

}