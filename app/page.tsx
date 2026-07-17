"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginComGoogle } from "./lib/auth";
import { salvarUsuario } from "./lib/storage";
import { salvarLead } from "./lib/leads";

export default function Formulario() {

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [slide, setSlide] = useState(0);


  const imagens = [
    "/1.png",
    "/2.png",
    "/3.png",
    "/4.png",
    "/5.png",
    "/6.png",
    "/7.png",
    "/8.png",
    "/9.png",
    "/10.png",
    "/11.png",
    "/12.png",
  ];



  useEffect(() => {

    const timer = setInterval(() => {

      setSlide((prev) =>
        prev === imagens.length - 1
          ? 0
          : prev + 1
      );

    }, 3000);


    return () => clearInterval(timer);


  }, [imagens.length]);





  async function continuar() {
  const emailLimpo = email.trim().toLowerCase();

  if (!emailLimpo) {
    alert("Digite um e-mail.");
    return;
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValido.test(emailLimpo)) {
    alert("Digite um e-mail válido.");
    return;
  }

  const sucesso = await salvarLead({
    email: emailLimpo,
    origem: "email",
  });

  if (!sucesso) {
    alert("Não foi possível salvar seu e-mail.");
    return;
  }

  localStorage.setItem(
  "usuario",
  JSON.stringify({
    email: emailLimpo,
    origem: "email",
  })
);

  router.push("/formulario");
}

async function entrarGoogle() {
  try {
    // Abre o login do Google
    const usuario = await loginComGoogle();

    // Salva ou atualiza o lead no Firestore
    const sucesso = await salvarLead({
      email: usuario.email,
      origem: "google",
      uid: usuario.uid,
      nome: usuario.nome,
    });

    if (!sucesso) {
      alert("Não foi possível salvar o usuário.");
      return;
    }

    // Salva o usuário no localStorage
    salvarUsuario({
      uid: usuario.uid,
      nome: usuario.nome,
      email: usuario.email,
      foto: usuario.foto,
      origem: "google",
    });

    // Vai para o formulário
    router.push("/formulario");

  } catch (error) {
    console.error("Erro ao entrar com Google:", error);
    alert("Não foi possível entrar com Google.");
  }
}

  const styles: {
    [key: string]: React.CSSProperties
  } = {


    container: {

      minHeight: "100vh",

      display: "flex",

      flexDirection: "column" as const,

      alignItems: "center",

      justifyContent: "center",

      padding: "20px",

      background: "#f7f7f7",

      gap: "18px",

    },



    carousel: {

      width: "300px",

      height: "300px",

      overflow: "hidden",

      borderRadius: "20px",

    },



    track: {

      display: "flex",

      flexDirection: "row" as const,

      height: "100%",

      width: `${imagens.length * 100}%`,

      transform: `translateX(-${slide * (100 / imagens.length)}%)`,

      transition: "transform 0.5s ease",

    },



    image: {

      width: `${100 / imagens.length}%`,

      height: "100%",

      objectFit: "cover" as const,

      flexShrink: 0,

    },



    title: {

      fontSize: 28,

      fontWeight: 700,

      textAlign: "center" as const,

    },



    buttonWhite: {

      width: "100%",

      maxWidth: "320px",

      padding: "14px",

      borderRadius: "12px",

      border: "1px solid #ddd",

      background: "#fff",

      cursor: "pointer",

      fontSize: 16,

    },



    input: {

      width: "100%",

      maxWidth: "320px",

      padding: "14px",

      borderRadius: "12px",

      border: "1px solid #ccc",

      fontSize: 16,

    },



    buttonMain: {

      width: "100%",

      maxWidth: "320px",

      padding: "14px",

      borderRadius: "12px",

      border: "none",

      background: "#111",

      color: "#fff",

      cursor: "pointer",

      fontSize: 16,

    },


  };







  return (

    <main style={styles.container}>


      <div style={styles.carousel}>


        <div style={styles.track}>


          {imagens.map((img, index) => (

            <img

              key={index}

              src={img}

              alt={`Imagem ${index + 1}`}

              style={styles.image}

            />


          ))}


        </div>


      </div>





      <h2 style={styles.title}>

        Seu Nutri

      </h2>





      <button
  onClick={entrarGoogle}
  style={styles.buttonWhite}
>
  Entrar com Google
</button>





      <input

        type="email"

        placeholder="Seu e-mail"

        value={email}

        onChange={(e) =>
          setEmail(e.target.value)
        }

        style={styles.input}

      />





      <button

        onClick={continuar}

        style={styles.buttonMain}

      >

        Continuar

      </button>



    </main>

  );

}