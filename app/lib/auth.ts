import {
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import {
  auth,
  googleProvider,
} from "./firebase";


// LOGIN COM GOOGLE
export async function loginComGoogle() {

  const result = await signInWithPopup(
    auth,
    googleProvider
  );

  return {
    uid: result.user.uid,
    nome: result.user.displayName ?? "",
    email: result.user.email ?? "",
    foto: result.user.photoURL ?? "",
  };
}


// LOGIN COM EMAIL E SENHA
export async function loginComEmail(
  email: string,
  senha: string
) {

  const result = await signInWithEmailAndPassword(
    auth,
    email,
    senha
  );

  return {
    uid: result.user.uid,
    nome: result.user.displayName ?? "",
    email: result.user.email ?? "",
    foto: result.user.photoURL ?? "",
  };
}


// RECUPERAR SENHA
export async function recuperarSenha(
  email: string
) {

  await sendPasswordResetEmail(
    auth,
    email
  );

}


// LOGOUT
export async function logout() {

  await signOut(auth);

}


// LOGIN ANÔNIMO
export async function loginAnonimo() {

  const result = await signInAnonymously(auth);

  return {
    uid: result.user.uid,
    email: result.user.email,
  };

}