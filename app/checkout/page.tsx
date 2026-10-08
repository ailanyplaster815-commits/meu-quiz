"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function CheckoutPage() {
  const [pagamento, setPagamento] = useState<"pix" | "cartao">("pix");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [cpf, setCpf] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [preco, setPreco] = useState(0);
  const [plano, setPlano] = useState("");

  const [pixGerado, setPixGerado] = useState(false);
  const [pixQrCode, setPixQrCode] = useState("");
  const [pixCopiaCola, setPixCopiaCola] = useState("");

  useEffect(() => {
    const precoSalvo = localStorage.getItem("precoTotal");
    const planoSalvo = localStorage.getItem("planoSelecionado");

    if (precoSalvo) {
      setPreco(Number(precoSalvo));
    }

    if (planoSalvo) {
      setPlano(planoSalvo);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("USUÁRIO FIREBASE:", user);

      if (user) {
        console.log("UID ENCONTRADO:", user.uid);

        setUid(user.uid);

        if (user.email) {
          setEmail(user.email);
        }
      } else {
        console.log("NENHUM USUÁRIO LOGADO");

        setUid("");
        setEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  async function finalizarPagamento() {
    if (!uid) {
      alert(
        "Não foi possível identificar sua conta. Atualize a página e tente novamente."
      );
      return;
    }

    if (!email.trim()) {
      alert("Não foi possível identificar seu e-mail.");
      return;
    }

    if (preco <= 0) {
      alert("Não foi possível identificar o valor do plano.");
      return;
    }

    if (pagamento === "cartao" && !cpf.trim()) {
      alert("Digite seu CPF.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/asaas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          email: email,
          cpfCnpj: pagamento === "cartao" ? cpf : undefined,
          valor: preco,
          plano: plano,
          pagamento: pagamento,
        }),
      });

      const dados = await resposta.json();

      console.log("Resposta da API:", dados);

      if (!resposta.ok) {
        console.error("Erro retornado pela API:", dados);

        alert(
          dados?.mensagem ||
            "Não foi possível criar o pagamento. Verifique os dados e tente novamente."
        );

        return;
      }

      if (pagamento === "pix") {
        if (!dados.pix?.encodedImage || !dados.pix?.payload) {
          console.error("Resposta sem dados PIX:", dados);

          alert("O Asaas não retornou os dados do PIX.");
          return;
        }

        setPixQrCode(dados.pix.encodedImage);
        setPixCopiaCola(dados.pix.payload);
        setPixGerado(true);
      }

      console.log("Pagamento criado:", dados);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <div className="mx-auto w-full max-w-3xl px-4 pt-4">
        <div className="mx-auto h-[100px] w-full overflow-hidden rounded-xl bg-white shadow-sm">
          <img
            src="/maca-1.png"
            alt="Seu Nutri"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="mb-5 text-xl font-bold text-gray-900">
            Escolha como pagar
          </h1>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setPagamento("pix");
                setPixGerado(false);
              }}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                pagamento === "pix"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <span className="text-sm font-bold text-green-600">
                  PIX
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">PIX</p>
                <p className="text-xs text-gray-500">Instantâneo</p>
              </div>

              {pagamento === "pix" && (
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-green-600"
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setPagamento("cartao");
                setPixGerado(false);
              }}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                pagamento === "cartao"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <CreditCard size={21} className="text-gray-700" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">Cartão</p>
                <p className="text-xs text-gray-500">
                  Cartão de crédito
                </p>
              </div>

              {pagamento === "cartao" && (
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-green-600"
                />
              )}
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-600">
                <span className="font-bold text-white">SN</span>
              </div>

              <span className="text-xl font-bold text-gray-900">
                Seu Nutri
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">
                  {pagamento === "pix"
                    ? "Pagamento via PIX"
                    : "Pagamento via Cartão"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Plano personalizado
                </p>
              </div>

              <strong className="whitespace-nowrap text-xl text-gray-900">
                R$ {preco.toFixed(2).replace(".", ",")}
              </strong>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Seu e-mail:
            </label>

            <input
              type="email"
              value={email}
              readOnly
              placeholder="Seu e-mail"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 outline-none"
            />

            <p className="mt-2 text-xs text-gray-500">
              Este é o e-mail usado para acessar sua conta no Seu Nutri.
            </p>
          </div>

          {pagamento === "cartao" && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                CPF
              </label>

              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          )}

          {pagamento === "pix" && !pixGerado && (
            <div className="mt-5 rounded-xl bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={22}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <div>
                  <p className="font-semibold text-gray-900">
                    Pagamento via PIX
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Ao finalizar, seu código PIX será gerado para pagamento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {pagamento === "cartao" && (
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Dados do Cartão
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Número do cartão
                  </label>

                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Validade
                    </label>

                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      CVV
                    </label>

                    <input
                      type="text"
                      placeholder="123"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {pagamento === "pix" && pixGerado && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  PIX gerado com sucesso!
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Escaneie o QR Code abaixo para realizar o pagamento.
                </p>

                {pixQrCode && (
                  <div className="mt-5 flex justify-center">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <img
                        src={`data:image/png;base64,${pixQrCode}`}
                        alt="QR Code PIX"
                        className="h-64 w-64 object-contain"
                      />
                    </div>
                  </div>
                )}

                {pixCopiaCola && (
                  <div className="mt-5">
                    <p className="mb-2 text-left text-sm font-semibold text-gray-800">
                      PIX Copia e Cola
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pixCopiaCola}
                        readOnly
                        className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-3 text-xs text-gray-700 outline-none"
                      />

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              pixCopiaCola
                            );

                            alert("Código PIX copiado!");
                          } catch (error) {
                            console.error(
                              "Erro ao copiar PIX:",
                              error
                            );

                            alert(
                              "Não foi possível copiar o código PIX."
                            );
                          }
                        }}
                        className="shrink-0 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-center gap-2 text-sm text-green-700">
                  <CheckCircle2 size={18} />
                  <span>Aguardando confirmação do pagamento</span>
                </div>
              </div>
            </div>
          )}

          {!pixGerado && (
            <button
              type="button"
              onClick={finalizarPagamento}
              disabled={carregando}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? (
                "Gerando pagamento..."
              ) : (
                <>
                  <Lock size={18} />

                  {pagamento === "pix"
                    ? "Gerar PIX"
                    : "Finalizar pagamento"}
                </>
              )}
            </button>
          )}

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={16} />
            <span>Pagamento seguro</span>
          </div>
        </section>
      </div>
    </main>
  );
}