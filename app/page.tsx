"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  loginComGoogle,
  loginComEmail,
  recuperarSenha,
} from "./lib/auth";

import { salvarUsuario } from "./lib/storage";
import { salvarLead } from "./lib/leads";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoLogin, setModoLogin] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // NOVO USUÁRIO
  async function continuar() {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      setMensagem("Digite seu e-mail.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setMensagem("Digite um e-mail válido.");
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");

      await salvarLead({
        email: emailLimpo,
        origem: "email",
      });

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          email: emailLimpo,
          origem: "email",
        })
      );

      router.push("/formulario");
    } catch (error) {
      console.error(error);
      setMensagem("Não foi possível continuar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // LOGIN COM GOOGLE
  async function entrarGoogle() {
    try {
      setCarregando(true);
      setMensagem("");

      const usuario = await loginComGoogle();

      await salvarLead({
        email: usuario.email,
        origem: "google",
        uid: usuario.uid,
        nome: usuario.nome,
      });

      await salvarUsuario({
        uid: usuario.uid,
        nome: usuario.nome,
        email: usuario.email,
        foto: usuario.foto,
        origem: "google",
      });

      router.push("/formulario");
    } catch (error) {
      console.error(error);
      setMensagem("Não foi possível entrar com o Google.");
    } finally {
      setCarregando(false);
    }
  }

  // LOGIN DO CLIENTE
  async function entrarCliente() {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo || !senha) {
      setMensagem("Digite seu e-mail e sua senha.");
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");

      const usuario = await loginComEmail(
        emailLimpo,
        senha
      );

      await salvarUsuario({
        uid: usuario.uid,
        nome: usuario.nome,
        email: usuario.email,
        foto: usuario.foto,
        origem: "email",
      });

      router.push("/dieta");
    } catch (error: any) {
      console.error(error);

      if (error?.code === "auth/invalid-credential") {
        setMensagem("E-mail ou senha incorretos.");
      } else if (error?.code === "auth/wrong-password") {
        setMensagem("Senha incorreta.");
      } else if (error?.code === "auth/user-not-found") {
        setMensagem("Usuário não encontrado.");
      } else {
        setMensagem("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  // RECUPERAR SENHA
  async function esquecerSenha() {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      setMensagem("Digite seu e-mail primeiro.");
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");

      await recuperarSenha(emailLimpo);

      setMensagem(
        "Enviamos um link para redefinir sua senha."
      );
    } catch (error: any) {
      console.error(error);

      if (error?.code === "auth/user-not-found") {
        setMensagem(
          "Não encontramos uma conta com esse e-mail."
        );
      } else {
        setMensagem(
          "Não foi possível enviar o link. Tente novamente."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[390px]">

        {/* IMAGEM DA MAÇÃ */}
        <div className="w-full h-[100px] mb-4 flex items-center justify-center">
          <img
            src="/maca-1.png"
            alt="Seu Nutri"
            className="w-full h-full object-contain"
          />
        </div>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-8">

          {/* LOGO */}
          <div className="text-center mb-7">
            <div className="text-3xl font-bold tracking-tight text-[#19a463]">
              seu nutri
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center mb-7">
            <h1 className="text-[25px] font-semibold text-gray-900">
              Bem-vindo de volta
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* GOOGLE */}
          <button
            type="button"
            onClick={entrarGoogle}
            disabled={carregando}
            className="w-full h-12 rounded-xl border border-gray-300 bg-white text-gray-800 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition disabled:opacity-60"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.72-.06-1.41-.18-2.08H12v3.94h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.24Z"
              />

              <path
                fill="#34A853"
                d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.52A9.75 9.75 0 0 0 12 21.5Z"
              />

              <path
                fill="#FBBC05"
                d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.1-1.09.31-1.59V7.89H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.36l3.25-2.77Z"
              />

              <path
                fill="#EA4335"
                d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.45 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.71 5.39l3.25 2.52C7.31 8.1 9.46 6.38 12 6.38Z"
              />
            </svg>

            Continuar com Google
          </button>

          {/* DIVISOR */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-xs text-gray-400">
              ou
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* E-MAIL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>

            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  width="20"
                  height="16"
                  x="2"
                  y="4"
                  rx="2"
                />

                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMensagem("");
                }}
                placeholder="seu@email.com"
                className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#19a463] focus:ring-2 focus:ring-[#19a463]/10"
              />
            </div>
          </div>

          {/* SENHA */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>

            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  width="18"
                  height="11"
                  x="3"
                  y="11"
                  rx="2"
                />

                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>

              <input
                type="password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setMensagem("");
                }}
                placeholder="Digite sua senha"
                className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#19a463] focus:ring-2 focus:ring-[#19a463]/10"
              />
            </div>
          </div>

          {/* ESQUECEU A SENHA */}
          <div className="text-right mb-5">
            <button
              type="button"
              onClick={esquecerSenha}
              disabled={carregando}
              className="text-sm font-medium text-[#19a463] hover:underline disabled:opacity-60"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* MENSAGEM */}
          {mensagem && (
            <div className="mb-4 text-sm text-center text-red-500">
              {mensagem}
            </div>
          )}

          {/* BOTÃO PRINCIPAL */}
          <button
            type="button"
            onClick={modoLogin ? entrarCliente : continuar}
            disabled={carregando}
            className="w-full h-12 rounded-xl bg-[#19a463] text-white font-semibold hover:bg-[#158a53] transition disabled:opacity-60"
          >
            {carregando ? "Aguarde..." : "Entrar"}
          </button>

          {/* TROCAR MODO */}
          <div className="mt-6 text-center text-sm text-gray-500">
            {modoLogin ? (
              <>
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setModoLogin(false);
                    setSenha("");
                    setMensagem("");
                  }}
                  className="font-semibold text-[#19a463] hover:underline"
                >
                  Criar uma conta
                </button>
              </>
            ) : (
              <>
                Já é cliente?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setModoLogin(true);
                    setMensagem("");
                  }}
                  className="font-semibold text-[#19a463] hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}