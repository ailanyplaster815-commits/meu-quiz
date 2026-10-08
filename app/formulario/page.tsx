"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { QuizData } from "@/types/quiz";
import { db, auth } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* =========================
   FORMULÁRIO PRINCIPAL
========================= */

export default function Formulario() {
  const router = useRouter();
  const [authCarregado, setAuthCarregado] = useState(false);

  const [formulario, setFormulario] = useState<QuizData>({
    peso: "",
    altura: "",
    idade: "",
    objetivo: "",
    sexo: "",
    horario: "",
    rotina: "",
    atividade: "",
    treino: "",
    observacao: "",
    alimentos: [] as string[],
  });

  const [cafeSelecionados, setCafeSelecionados] = useState<string[]>([]);
  const [almocoSelecionados, setAlmocoSelecionados] = useState<string[]>([]);
  const [lancheSelecionados, setLancheSelecionados] = useState<string[]>([]);
  const [jantaSelecionados, setJantaSelecionados] = useState<string[]>([]);

  /* =========================
     SALVAR FORMULÁRIO
  ========================= */

  const salvarFormulario = async () => {
    console.log("========== INÍCIO DO SALVAMENTO ==========");
    console.log("Formulário atual:", formulario);

    try {
      if (!authCarregado) {
        console.log("⏳ Firebase Auth ainda carregando...");
        alert("Aguarde o carregamento do usuário...");
        return;
      }

      const user = auth.currentUser;

      console.log("Usuário atual:", user);

      if (!user) {
        console.log("❌ Nenhum usuário autenticado.");
        alert("Usuário não autenticado. Faça login novamente.");
        return;
      }

      console.log("UID:", user.uid);
      console.log("Email:", user.email);

      const dadosQuiz = {
        peso: formulario.peso,
        altura: formulario.altura,
        idade: formulario.idade,
        objetivo: formulario.objetivo,
        sexo: formulario.sexo,
        horario: formulario.horario,
        rotina: formulario.rotina,
        atividade: formulario.atividade,
        treino: formulario.treino,
        observacao: formulario.observacao,
        alimentos: formulario.alimentos,

        uid: user.uid,
        email: user.email,
        nome: user.displayName,
        foto: user.photoURL,

        etapa: "questionario",
        updatedAt: new Date(),
      };

      console.log("📦 Salvando questionário no Firebase...");

      await setDoc(
        doc(db, "quizzes", user.uid),
        dadosQuiz,
        { merge: true }
      );

      console.log("✅ QUIZ SALVO COM SUCESSO!");

      /* =========================
         GERAR DIETA COM IA
      ========================= */

      console.log("🤖 Enviando questionário para o Gemini...");

      const response = await fetch("/api/gerar-dieta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const resultado = await response.json();

      console.log("📥 Resposta da IA:", resultado);

      if (!response.ok || !resultado.sucesso) {
        throw new Error(
          resultado.erro || "Não foi possível gerar a dieta."
        );
      }

      console.log("✅ DIETA GERADA COM SUCESSO!");
      console.log(resultado.dieta);

      localStorage.setItem(
        "dietaGerada",
        JSON.stringify(resultado.dieta)
      );

      router.push("/preparando");
    } catch (error) {
      console.error("❌ ERRO NO PROCESSO:");
      console.error(error);

      alert(
        "Não foi possível montar sua dieta agora. Veja o console para mais detalhes."
      );
    }
  };

  /* =========================
     CARREGAR FORMULÁRIO
  ========================= */

  useEffect(() => {
  const carregarDadosSalvos = async () => {
    if (!authCarregado) return;

    const user = auth.currentUser;

    if (!user) return;

    try {
      const ref = doc(db, "quizzes", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const dados = snap.data();

        const alimentosSalvos: string[] = Array.isArray(dados.alimentos)
          ? dados.alimentos
          : [];

        setFormulario((anterior) => ({
          ...anterior,
          peso: dados.peso || "",
          altura: dados.altura || "",
          idade: dados.idade || "",
          objetivo: dados.objetivo || "",
          sexo: dados.sexo || "",
          horario: dados.horario || "",
          rotina: dados.rotina || "",
          atividade: dados.atividade || "",
          treino: dados.treino || "",
          observacao: dados.observacao || "",
          alimentos: alimentosSalvos,
        }));

        // Recupera as opções que já estavam selecionadas
        setCafeSelecionados(
          alimentosSalvos.filter((item) => cafe.includes(item))
        );

        setAlmocoSelecionados(
          alimentosSalvos.filter((item) => almoco.includes(item))
        );

        // Como o lanche atualmente usa a lista "cafe",
        // recuperamos as opções do lanche usando essa mesma lista.
        setLancheSelecionados(
          alimentosSalvos.filter((item) => cafe.includes(item))
        );

        // Como a janta atualmente usa a lista "almoco",
        // recuperamos as opções da janta usando essa mesma lista.
        setJantaSelecionados(
          alimentosSalvos.filter((item) => almoco.includes(item))
        );
      }
    } catch (erro) {
      console.error("Erro ao carregar dados salvos:", erro);
    }
  };

  carregarDadosSalvos();
}, [authCarregado]);

  /* =========================
     FIREBASE AUTH
  ========================= */

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Usuário autenticado:", user.uid);
      } else {
        console.log("Nenhum usuário autenticado");
      }

      setAuthCarregado(true);
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     SALVAR NO LOCALSTORAGE
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      "formulario",
      JSON.stringify(formulario)
    );
  }, [formulario]);

  /* =========================
     REFS
  ========================= */

  const objetivoRef = useRef<HTMLSelectElement>(null);
  const cafeRef = useRef<HTMLDivElement>(null);
  const almocoRef = useRef<HTMLDivElement>(null);
  const lancheRef = useRef<HTMLDivElement>(null);
  const jantaRef = useRef<HTMLDivElement>(null);

  const pesoRef = useRef<HTMLInputElement>(null);
  const alturaRef = useRef<HTMLInputElement>(null);
  const idadeRef = useRef<HTMLInputElement>(null);
  const horarioRef = useRef<HTMLSelectElement>(null);
  const sexoRef = useRef<HTMLDivElement>(null);

  /* =========================
     SELEÇÃO DOS ALIMENTOS
  ========================= */

  function toggleItem(item: string) {
    setFormulario((prev) => {
      const existe = prev.alimentos.includes(item);

      return {
        ...prev,
        alimentos: existe
          ? prev.alimentos.filter((i) => i !== item)
          : [...prev.alimentos, item],
      };
    });
  }

  function toggleCafe(item: string) {
    setCafeSelecionados((prev) => {
      const existe = prev.includes(item);

      return existe
        ? prev.filter((i) => i !== item)
        : [...prev, item];
    });

    toggleItem(item);
  }

  function toggleAlmoco(item: string) {
    setAlmocoSelecionados((prev) => {
      const existe = prev.includes(item);

      return existe
        ? prev.filter((i) => i !== item)
        : [...prev, item];
    });

    toggleItem(item);
  }

  function toggleLanche(item: string) {
    setLancheSelecionados((prev) => {
      const existe = prev.includes(item);

      return existe
        ? prev.filter((i) => i !== item)
        : [...prev, item];
    });

    toggleItem(item);
  }

  function toggleJanta(item: string) {
    setJantaSelecionados((prev) => {
      const existe = prev.includes(item);

      return existe
        ? prev.filter((i) => i !== item)
        : [...prev, item];
    });

    toggleItem(item);
  }

  /* =========================
     EDITAR OBJETIVO
  ========================= */

  useEffect(() => {
    const editarObjetivo = localStorage.getItem("editarObjetivo");

    if (editarObjetivo === "true") {
      setTimeout(() => {
        objetivoRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        objetivoRef.current?.focus();

        localStorage.removeItem("editarObjetivo");
      }, 300);
    }
  }, []);

  /* =========================
     COMPONENTES DOS ALIMENTOS
  ========================= */

  function Item({ text }: { text: string }) {
    const active = formulario.alimentos.includes(text);

    return (
      <div
        onClick={() => toggleItem(text)}
        style={{
          ...card,
          border: active ? "2px solid #16a329" : "1px solid #ddd",
          background: active ? "#dcfce7" : "#fff",
          color: active ? "#166534" : "#111827",
          fontWeight: active ? 600 : 400,
        }}
      >
        <span>{text}</span>
        {active && <span>✅</span>}
      </div>
    );
  }

  function CafeItem({ text }: { text: string }) {
    const active = cafeSelecionados.includes(text);

    return (
      <div
        onClick={() => toggleCafe(text)}
        style={{
          ...card,
          border: active ? "2px solid #16a329" : "1px solid #ddd",
          background: active ? "#dcfce7" : "#fff",
          color: active ? "#166534" : "#111827",
          fontWeight: active ? 600 : 400,
        }}
      >
        <span>{text}</span>
        {active && <span>✅</span>}
      </div>
    );
  }

  function CafeGrid() {
    return (
      <div style={grid}>
        {cafe.map((item, index) => (
          <CafeItem key={index} text={item} />
        ))}
      </div>
    );
  }

  function AlmocoItem({ text }: { text: string }) {
    const active = almocoSelecionados.includes(text);

    return (
      <div
        onClick={() => toggleAlmoco(text)}
        style={{
          ...card,
          border: active ? "2px solid #16a329" : "1px solid #ddd",
          background: active ? "#dcfce7" : "#fff",
          color: active ? "#166534" : "#111827",
          fontWeight: active ? 600 : 400,
        }}
      >
        <span>{text}</span>
        {active && <span>✅</span>}
      </div>
    );
  }

  function AlmocoGrid() {
    return (
      <div style={grid}>
        {almoco.map((item, index) => (
          <AlmocoItem key={index} text={item} />
        ))}
      </div>
    );
  }

  function LancheItem({ text }: { text: string }) {
    const active = lancheSelecionados.includes(text);

    return (
      <div
        onClick={() => toggleLanche(text)}
        style={{
          ...card,
          border: active ? "2px solid #16a329" : "1px solid #ddd",
          background: active ? "#dcfce7" : "#fff",
          color: active ? "#166534" : "#111827",
          fontWeight: active ? 600 : 400,
        }}
      >
        <span>{text}</span>
        {active && <span>✅</span>}
      </div>
    );
  }

  function LancheGrid() {
    return (
      <div style={grid}>
        {cafe.map((item, index) => (
          <LancheItem key={index} text={item} />
        ))}
      </div>
    );
  }

  function Grid({ items }: { items: string[] }) {
    return (
      <div style={grid}>
        {items.map((item, index) => (
          <Item key={index} text={item} />
        ))}
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <main style={container}>
      <div style={box}>

        {/* MEDIDAS CORPORAIS */}

        <CardSection title="Medidas corporais🧍‍♀️📏">

  <p
    style={{
      margin: 0,
      fontSize: 13,
      color: "#777",
    }}
  >
    Preencha com as suas informações
  </p>

  <input
    ref={pesoRef}
    style={input}
    placeholder="Peso (kg)"
    value={formulario.peso}
    onChange={(e) =>
      setFormulario({
        ...formulario,
        peso: e.target.value,
      })
    }
  />

          <input
            ref={alturaRef}
            style={input}
            placeholder="Altura (cm)"
            value={formulario.altura}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                altura: e.target.value,
              })
            }
          />

          <input
            ref={idadeRef}
            style={input}
            placeholder="Idade"
            value={formulario.idade}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                idade: e.target.value,
              })
            }
          />

          {/* OBJETIVO */}

          <select
            ref={objetivoRef}
            style={input}
            value={formulario.objetivo}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                objetivo: e.target.value,
              })
            }
          >
            <option value="">Objetivo</option>
            <option value="Ganhar massa muscular">
              Ganhar massa muscular
            </option>
            <option value="Perder peso">
              Perder peso
            </option>
            <option value="Manter boa forma">
              Manter boa forma
            </option>
          </select>

          {/* HORÁRIOS */}

          <select
            ref={horarioRef}
            style={input}
            value={formulario.horario}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                horario: e.target.value,
              })
            }
          >
            <option value="">
              Horários das refeições
            </option>

            <option value="05:30 / 08:30 / 12:00 / 15:00 / 19:00">
              05:30 / 08:30 / 12:00 / 15:00 / 19:00
            </option>

            <option value="06:00 / 09:00 / 12:00 / 15:00 / 19:00">
              06:00 / 09:00 / 12:00 / 15:00 / 19:00
            </option>

            <option value="06:30 / 09:30 / 13:00 / 16:00 / 20:00">
              06:30 / 09:30 / 13:00 / 16:00 / 20:00
            </option>

            <option value="07:00 / 10:00 / 12:30 / 15:30 / 19:30">
              07:00 / 10:00 / 12:30 / 15:30 / 19:30
            </option>

            <option value="07:30 / 10:30 / 12:00 / 15:00 / 19:00">
              07:30 / 10:30 / 12:00 / 15:00 / 19:00
            </option>

            <option value="08:00 / 11:00 / 13:30 / 16:30 / 20:30">
              08:00 / 11:00 / 13:30 / 16:30 / 20:30
            </option>
          </select>

          {/* SEXO */}

          <div ref={sexoRef} style={row}>
            <button
              type="button"
              style={sexoBtn(formulario.sexo === "masculino")}
              onClick={() =>
                setFormulario({
                  ...formulario,
                  sexo: "masculino",
                })
              }
            >
              Masculino♂️
            </button>

            <button
              type="button"
              style={sexoBtn(formulario.sexo === "feminino")}
              onClick={() =>
                setFormulario({
                  ...formulario,
                  sexo: "feminino",
                })
              }
            >
              Feminino♀️
            </button>
          </div>

        </CardSection>

        {/* CAFÉ DA MANHÃ */}

        <div ref={cafeRef}>
          <CardSection title="Café da manhã☕">

            <p
              style={{
                margin: 0,
                fontSize: 13,
                color:
                  cafeSelecionados.length >= 3
                    ? "#16a329"
                    : "#777",
              }}
            >
              {cafeSelecionados.length >= 3
                ? `✓ ${cafeSelecionados.length} opções selecionadas`
                : "Selecione pelo menos 3 opções"}
            </p>

            <CafeGrid />

          </CardSection>
        </div>

        {/* ALMOÇO */}

        <div ref={almocoRef}>
          <CardSection title="Almoço🍽️">

            <p
              style={{
                margin: 0,
                fontSize: 13,
                color:
                  almocoSelecionados.length >= 3
                    ? "#16a329"
                    : "#777",
              }}
            >
              {almocoSelecionados.length >= 3
                ? `✓ ${almocoSelecionados.length} opções selecionadas`
                : "Selecione pelo menos 3 opções"}
            </p>

            <AlmocoGrid />

          </CardSection>
        </div>

        {/* LANCHE DA TARDE */}

        <div ref={lancheRef}>
          <CardSection title="Lanche da Tarde🥐">

            <p
              style={{
                margin: 0,
                fontSize: 13,
                color:
                  lancheSelecionados.length >= 3
                    ? "#16a329"
                    : "#777",
              }}
            >
              {lancheSelecionados.length >= 3
                ? `✓ ${lancheSelecionados.length} opções selecionadas`
                : "Selecione pelo menos 3 opções"}
            </p>

            <LancheGrid />

          </CardSection>
        </div>

        {/* JANTA */}

        <div ref={jantaRef}>
          <CardSection title="Janta🍴">

            <p
              style={{
                margin: 0,
                fontSize: 13,
                color:
                  jantaSelecionados.length >= 3
                    ? "#16a329"
                    : "#777",
              }}
            >
              {jantaSelecionados.length >= 3
                ? `✓ ${jantaSelecionados.length} opções selecionadas`
                : "Selecione pelo menos 3 opções"}
            </p>

            <div style={grid}>
              {almoco.map((item, index) => {
                const active =
                  jantaSelecionados.includes(item);

                return (
                  <div
                    key={index}
                    onClick={() => toggleJanta(item)}
                    style={{
                      ...card,
                      border: active
                        ? "2px solid #16a329"
                        : "1px solid #ddd",
                      background: active
                        ? "#dcfce7"
                        : "#fff",
                      color: active
                        ? "#166534"
                        : "#111827",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <span>{item}</span>
                    {active && <span>✅</span>}
                  </div>
                );
              })}
            </div>

          </CardSection>
        </div>

        {/* OBSERVAÇÃO */}

        <CardSection title="Lanche da manhã (opcional)">
          <input
            style={input}
            placeholder="Digite aqui..."
            value={formulario.observacao}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                observacao: e.target.value,
              })
            }
          />
        </CardSection>

        {/* ROTINA */}

        <CardSection title="Informações de Rotina">

          <select
            style={input}
            value={formulario.rotina}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                rotina: e.target.value,
              })
            }
          >
            <option value="">
              Como é sua rotina?
            </option>
            <option value="Leve">Leve</option>
            <option value="Moderada">Moderada</option>
            <option value="Intensa">Intensa</option>
          </select>

          <select
            style={input}
            value={formulario.atividade}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                atividade: e.target.value,
              })
            }
          >
            <option value="">
              Quantidade de atividade atual
            </option>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>

          <select
            style={input}
            value={formulario.treino}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                treino: e.target.value,
              })
            }
          >
            <option value="">
              Deseja treino?
            </option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>

        </CardSection>

        {/* CHOCOLATE */}

        <CardSection title="🍫 Quer Chocolate?">
          <Grid
            items={[
              "Não",
              "Chocolate branco",
              "Chocolate preto",
            ]}
          />
        </CardSection>

        {/* OFERTA FINAL */}

        <OfertaFinal
          salvarFormulario={salvarFormulario}
          formulario={formulario}
          cafeSelecionados={cafeSelecionados}
          almocoSelecionados={almocoSelecionados}
          lancheSelecionados={lancheSelecionados}
          jantaSelecionados={jantaSelecionados}

          scrollParaPeso={() => {
            pesoRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            pesoRef.current?.focus();
          }}

          scrollParaAltura={() => {
            alturaRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            alturaRef.current?.focus();
          }}

          scrollParaIdade={() => {
            idadeRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            idadeRef.current?.focus();
          }}

          scrollParaObjetivo={() => {
            objetivoRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            objetivoRef.current?.focus();
          }}

          scrollParaHorario={() => {
            horarioRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            horarioRef.current?.focus();
          }}

          scrollParaSexo={() => {
            sexoRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}

          scrollParaCafe={() => {
            cafeRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}

          scrollParaAlmoco={() => {
            almocoRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}

          scrollParaLanche={() => {
            lancheRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}

          scrollParaJanta={() => {
            jantaRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        />

      </div>
    </main>
  );
}

/* =========================
   OFERTA FINAL
========================= */

function OfertaFinal({
  salvarFormulario,
  formulario,
  cafeSelecionados,
  almocoSelecionados,
  lancheSelecionados,
  jantaSelecionados,
  scrollParaCafe,
  scrollParaAlmoco,
  scrollParaLanche,
  scrollParaJanta,
  scrollParaPeso,
  scrollParaAltura,
  scrollParaIdade,
  scrollParaObjetivo,
  scrollParaHorario,
  scrollParaSexo,
}: {
  salvarFormulario: () => Promise<void>;
  formulario: QuizData;

  cafeSelecionados: string[];
  almocoSelecionados: string[];
  lancheSelecionados: string[];
  jantaSelecionados: string[];

  scrollParaCafe: () => void;
  scrollParaAlmoco: () => void;
  scrollParaLanche: () => void;
  scrollParaJanta: () => void;

  scrollParaPeso: () => void;
  scrollParaAltura: () => void;
  scrollParaIdade: () => void;
  scrollParaObjetivo: () => void;
  scrollParaHorario: () => void;
  scrollParaSexo: () => void;
}) {
  const router = useRouter();
  const [hover, setHover] = useState(false);

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

  const [slide, setSlide] = useState(0);
  const itensPorPagina = 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) =>
        prev >=
        Math.ceil(imagens.length / itensPorPagina) - 1
          ? 0
          : prev + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={ofertaContainer}>

      <h2 style={ofertaTitulo}>
        Sua dieta, do seu jeito!
      </h2>

      <div style={social}>

        <div style={socialLeft}>
          <img src="/avatar1.png" style={avatarMini} />
          <img src="/avatar2.png" style={avatarMini} />
          <img src="/avatar3.png" style={avatarMini} />
          <img src="/avatar4.png" style={avatarMini} />
          <img src="/avatar5.png" style={avatarMini} />
        </div>

        <div style={socialRight}>
          +19 mil pessoas já usaram
        </div>

      </div>

      <p style={resultadoTitulo}>
        RESULTADOS REAIS
      </p>

      <div
  style={{
    width: "100%",
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 4,
  }}
>
  <div
    style={{
      display: "flex",
      gap: 10,
      transform: `translateX(-${slide * 33.33}%)`,
      transition: "transform 0.5s ease",
    }}
  >
    {imagens.map((img, index) => (
      <div
        key={index}
        style={{
          flex: "0 0 calc(33.33% - 7px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: 10,
        }}
      >
        <img
          src={img}
          alt={`Resultado ${index + 1}`}
          style={{
            width: "100%",
            height: 180,
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    ))}
  </div>
</div>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    marginBottom: 8,
  }}
>
  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
    (_, index) => (
      <div
        key={index}
        style={{
          width: slide === index ? 8 : 6,
          height: slide === index ? 8 : 6,
          borderRadius: "50%",
          background: "#16a329",
          opacity: slide === index ? 1 : 0.3,
          transition: "all 0.2s ease",
        }}
      />
    )
  )}

      </div>

      <div style={linha} />

      <div style={ofertaInfo}>

        <div style={precoBox}>

          <span
            style={{
              fontSize: 10,
              color: "#6b7280",
              fontWeight: 600,
            }}
          >
            A PARTIR DE
          </span>

          <strong
            style={{
              fontSize: 28,
              color: "#16a329",
            }}
          >
            <br />
            R$ 9,99
          </strong>

        </div>

        <div style={beneficios}>
          <p>✅ Plano alimentar completo</p>
          <p>✅ Baseado nas suas preferências</p>
          <p>✅ Modifique quando quiser</p>
        </div>

      </div>

      {/* BOTÃO FINAL */}

      <button
        type="button"
        style={{
          ...btnFinal,
          transform: hover
            ? "scale(1.08)"
            : "scale(1)",
          transition: "0.2s",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {

          if (!formulario.peso) {
            alert(
              "Preencha seu peso para continuar."
            );

            scrollParaPeso();
            return;
          }

          if (!formulario.altura) {
            alert(
              "Preencha sua altura para continuar."
            );

            scrollParaAltura();
            return;
          }

          if (!formulario.idade) {
            alert(
              "Preencha sua idade para continuar."
            );

            scrollParaIdade();
            return;
          }

          if (!formulario.objetivo) {
            alert(
              "Selecione seu objetivo para continuar."
            );

            scrollParaObjetivo();
            return;
          }

          if (!formulario.horario) {
            alert(
              "Selecione os horários das refeições para continuar."
            );

            scrollParaHorario();
            return;
          }

          if (!formulario.sexo) {
            alert(
              "Selecione seu gênero para continuar."
            );

            scrollParaSexo();
            return;
          }

          if (!formulario.rotina) {
  alert(
    "Selecione como é sua rotina para continuar."
  );
  return;
}

if (!formulario.atividade) {
  alert(
    "Selecione a quantidade de atividade atual para continuar."
  );
  return;
}

if (!formulario.treino) {
  alert(
    "Selecione se deseja treino para continuar."
  );
  return;
}

          if (cafeSelecionados.length < 3) {
            alert(
              "Selecione pelo menos 3 opções de café da manhã para continuar."
            );

            scrollParaCafe();
            return;
          }

          if (almocoSelecionados.length < 3) {
            alert(
              "Selecione pelo menos 3 opções de almoço para continuar."
            );

            scrollParaAlmoco();
            return;
          }

          if (lancheSelecionados.length < 3) {
            alert(
              "Selecione pelo menos 3 opções de lanche da tarde para continuar."
            );

            scrollParaLanche();
            return;
          }

          if (jantaSelecionados.length < 3) {
            alert(
              "Selecione pelo menos 3 opções de janta para continuar."
            );

            scrollParaJanta();
            return;
          }

          console.log(
            "🟢 Indo para a página de pacotes..."
          );

          router.push("/pacotes");
        }}
      >
        Montar minha dieta →
      </button>

      <p style={pagamento}>
        Pagamento seguro 🔒
      </p>

    </div>
  );
}

/* =========================
   COMPONENTES AUXILIARES
========================= */

function CardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={sectionCard}>
      <h2
        style={{
          margin: 0,
          fontSize: 18,
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}

/* =========================
   DATA
========================= */

const cafe = [
  "🥖 Pão + frango",
  "🥚 Pão + ovo",
  "🧀 Pão + queijo",
  "🥪 Pão + presunto + queijo",
  "🫓 Tapioca de queijo",
  "🍗 Tapioca de frango",
  "🌽 Cuscuz + ovo",
  "🧀 Pão de queijo",
  "🍳 Omelete",
  "🍎 Maçã",
  "🍌 Banana",
  "🥭 Mamão",
  "☕ Café + leite desnatado",
  "☕ Café",
  "🥛 Iogurte",
];

const almoco = [
  "🍚 Arroz",
  "🫘 Feijão preto",
  "🌽 Cuscuz",
  "🍝 Macarrão",
  "🍠 Batata doce",
  "🥔 Mandioca",
  "🥔 Inhame",
  "🥔 Batata inglesa",
  "🎃 Abóbora",
  "🍗 Frango grelhado",
  "🥩 Carne assada",
  "🥩 Carne grelhada",
  "🥩 Carne de porco Lombo",
  "🥩 Patinho moído",
  "🐟 Peixe",
  "🥗 Salada de alface e tomate",
  "🥬 Salada de alface",
  "🥗 Salada de legumes",
];

/* =========================
   STYLES
========================= */

const container = {
  minHeight: "100vh",
  background: "#f5f5f5",
  display: "flex",
  justifyContent: "center",
  padding: 20,
};

const box = {
  width: 420,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ccc",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const card = {
  padding: 10,
  borderRadius: 10,
  background: "#fff",
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
};

const row = {
  display: "flex",
  gap: 10,
};

const sexoBtn = (active: boolean) => ({
  flex: 1,
  padding: 12,
  borderRadius: 10,
  border: active
    ? "2px solid green"
    : "1px solid #ccc",
  background: active
    ? "#dcfce7"
    : "white",
});

const ofertaContainer = {
  background: "#fff",
  borderRadius: 20,
  padding: "25px 22px",
  marginTop: 35,
};

const ofertaTitulo = {
  fontSize: 22,
  fontWeight: 800,
};

const social = {
  display: "flex",
  alignItems: "center",
  marginTop: 15,
};

const socialLeft = {
  display: "flex",
  gap: 6,
};

const socialRight = {
  fontSize: 14,
};

const avatarMini = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "2px solid #16a329",
};

const resultadoTitulo = {
  fontSize: 12,
  color: "#999",
  marginTop: 12,
};

const carousel = {
  width: "100%",
  height: 280,
  overflow: "hidden",
};

const track = {
  display: "flex",
  transition: "transform 1s",
};

const imageBox = {
  minWidth: "33%",
  display: "flex",
  justifyContent: "space-around",
};

const carouselImage = {
  width: 100,
  height: 100,
  borderRadius: 12,
};

const dots = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
};

const dot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#16a329",
};

const linha = {
  height: 1,
  background: "#eee",
  margin: "20px 0",
};

const ofertaInfo = {
  display: "flex",
};

const precoBox = {
  width: 150,
  borderRight: "1px solid #ddd",
};

const beneficios = {
  paddingLeft: 20,
};

const btnFinal = {
  marginTop: 25,
  width: "100%",
  height: 55,
  borderRadius: 30,
  background: "#16a329",
  border: "none",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
};

const pagamento = {
  textAlign: "center" as const,
  color: "#aaa",
  fontSize: 13,
};

const sectionCard = {
  background: "#fff",
  padding: 18,
  borderRadius: 18,
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};