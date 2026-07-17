import {
  signInWithPopup,
  signInAnonymously,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  auth,
  googleProvider
} from "./firebase";



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




export async function loginComEmail(email: string) {


  const result = await signInAnonymously(auth);



  await updateProfile(
    result.user,
    {
      displayName: email,
    }
  );



  return {

    uid: result.user.uid,

    nome: email,

    email: email,

    foto: "",

  };

}




export async function logout() {

  await signOut(auth);

}