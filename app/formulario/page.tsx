"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { QuizData } from "@/types/quiz";
import { db, auth } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

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

  const salvarFormulario = async () => {
  console.log("Botão clicado");
  console.log(formulario);

  try {
    const user = auth.currentUser;

    if (!authCarregado) {
      alert("Aguarde carregando usuário...");
      return;
    }

    if (!user) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    await setDoc(
      doc(db, "quizzes", user.uid),
      {
        ...formulario,
        createdAt: new Date(),
        uid: user.uid,
        email: user.email,
        nome: user.displayName,
        foto: user.photoURL,
      },
      { merge: true }
    );

    console.log("Quiz salvo com sucesso!");

    router.push("/preparando");

  } catch (error) {
    console.error("ERRO FIREBASE:", error);
    alert(String(error));
  }
};

useEffect(() => {
  const salvo = localStorage.getItem("formulario");

if (salvo) {
  const dados = JSON.parse(salvo) as QuizData;
  setFormulario(dados);
}
}, []);

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

useEffect(() => {
  localStorage.setItem(
    "formulario",
    JSON.stringify(formulario)
  );
}, [formulario]);

  const objetivoRef = useRef<HTMLSelectElement>(null);

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

  function Grid({ items }: { items: string[] }) {
    return (
      <div style={grid}>
        {items.map((item, index) => (
          <Item key={index} text={item} />
        ))}
      </div>
    );
  }

  return (
    <main style={container}>
      <div style={box}>
        <CardSection title="Medidas corporais">
          <input
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
            <option value="Perder peso">Perder peso</option>
            <option value="Manter boa forma">Manter boa forma</option>
          </select>

<select
  style={input}
  value={formulario.horario}
  onChange={(e) =>
    setFormulario({
      ...formulario,
      horario: e.target.value,
    })
  }
>            <option value="">Horários das refeições</option>
<option value="08:00 / 11:00 / 14:00 / 18:00">
  08:00 / 11:00 / 14:00 / 18:00
</option>
<option value="07:00 / 10:00 / 13:00 / 19:00">
  07:00 / 10:00 / 13:00 / 19:00
</option>
          </select>

          <div style={row}>
  <button
    style={sexoBtn(formulario.sexo === "masculino")}
    onClick={() =>
      setFormulario({
        ...formulario,
        sexo: "masculino",
      })
    }
  >
    Masculino
  </button>

  <button
    style={sexoBtn(formulario.sexo === "feminino")}
    onClick={() =>
      setFormulario({
        ...formulario,
        sexo: "feminino",
      })
    }
  >
    Feminino
  </button>
</div>
</CardSection>

        <CardSection title="Café da manhã">
          <Grid items={cafe} />
        </CardSection>

        <CardSection title="Almoço">
          <Grid items={almoco} />
        </CardSection>

        <CardSection title="Lanche da Tarde">
          <Grid items={cafe} />
        </CardSection>

        <CardSection title="Janta">
          <Grid items={almoco} />
        </CardSection>

        <CardSection title="Lanche da manhã (opcional)"><input
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
  <option value="">Como é sua rotina?</option>
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
  <option value="">Quantidade de atividade atual</option>
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
  <option value="">Deseja treino?</option>
  <option value="Sim">Sim</option>
  <option value="Não">Não</option>
</select>
        </CardSection>

        <CardSection title="🍫 Quer Chocolate?">
          <Grid
            items={[
              "Não",
              "Chocolate branco",
              "Chocolate preto",
            ]}
          />
        </CardSection>

        <OfertaFinal salvarFormulario={salvarFormulario} />
      </div>
    </main>
  );
}

/* =========================
   OFERTA FINAL
========================= */

function OfertaFinal({
  salvarFormulario,
}: {
  salvarFormulario: () => Promise<void>;
}) {
  const router = useRouter();
  const [hover, setHover] = useState(false);

  const imagens = [
    "/1.png","/2.png","/3.png","/4.png","/5.png","/6.png",
    "/7.png","/8.png","/9.png","/10.png","/11.png","/12.png",
  ];

const [slide, setSlide] = useState(0);
const itensPorPagina = 3;

  useEffect(() => {
  const timer = setInterval(() => {
    setSlide((prev) =>
      prev >= Math.ceil(imagens.length / itensPorPagina) - 1
        ? 0
        : prev + 1
    );
  }, 3000);

  return () => clearInterval(timer);
}, []);

  return (
    <div style={ofertaContainer}>
      <h2 style={ofertaTitulo}>Sua dieta, do seu jeito!</h2>

      <div style={social}>
        <div style={socialLeft}>
          <img src="/avatar1.png" style={avatarMini} />
          <img src="/avatar2.png" style={avatarMini} />
          <img src="/avatar3.png" style={avatarMini} />
          <img src="/avatar4.png" style={avatarMini} />
          <img src="/avatar5.png" style={avatarMini} />
        </div>

        <div style={socialRight}>+19 mil pessoas já usaram</div>
      </div>

      <p style={resultadoTitulo}>RESULTADOS REAIS</p>

      <div style={carousel}>
        <div
          style={{
            ...track,
            transform: `translateX(-${slide * 33.33}%)`,
          }}
        >
          {imagens.map((img, index) => (
            <div key={index} style={imageBox}>
              <img src={img} style={carouselImage} />
            </div>
          ))}
        </div>
      </div>

      <div style={dots}>
        {[0,1,2,3,4,5,6,7,8,9].map((_, index) => (
          <div
            key={index}
            style={{
              ...dot,
              opacity: slide === index ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      <div style={linha} />

      <div style={ofertaInfo}>
        <div style={precoBox}>
          <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>
            A PARTIR DE
          </span>

          <strong style={{ fontSize: 28, color: "#16a329" }}>
            <br></br>R$ 9,99
          </strong>
        </div>

        <div style={beneficios}>
          <p>✅ Plano alimentar completo</p>
          <p>✅ Baseado nas suas preferências</p>
          <p>✅ Modifique quando quiser</p>
        </div>
      </div>

<button
  style={{
    ...btnFinal,
    transform: hover ? "scale(1.08)" : "scale(1)",
    transition: "0.2s",
  }}
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
  onClick={salvarFormulario}
>
  Montar minha dieta →
</button>

<p style={pagamento}>Pagamento seguro 🔒</p>
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
      <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
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
  "🥪 Pão + presunto",
  "🫓 Tapioca",
  "🍳 Omelete",
  "🍎 Maçã",
  "🍌 Banana",
  "☕ Café",
];

const almoco = [
  "🍚 Arroz",
  "🫘 Feijão",
  "🍝 Macarrão",
  "🍠 Batata doce",
  "🍗 Frango",
  "🥩 Carne",
  "🐟 Peixe",
  "🥗 Salada",
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

const row = { display: "flex", gap: 10 };

const sexoBtn = (active: boolean) => ({
  flex: 1,
  padding: 12,
  borderRadius: 10,
  border: active ? "2px solid green" : "1px solid #ccc",
  background: active ? "#dcfce7" : "white",
});

const ofertaContainer = {
  background: "#fff",
  borderRadius: 20,
  padding: "25px 22px",
  marginTop: 35,
};

const ofertaTitulo = { fontSize: 22, fontWeight: 800 };

const social = { display: "flex", alignItems: "center", marginTop: 15 };

const socialLeft = { display: "flex", gap: 6 };

const socialRight = { fontSize: 14 };

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

const dots = { display: "flex", justifyContent: "center", gap: 8 };

const dot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#16a329",
};

const linha = { height: 1, background: "#eee", margin: "20px 0" };

const ofertaInfo = { display: "flex" };

const precoBox = { width: 150, borderRight: "1px solid #ddd" };

const beneficios = { paddingLeft: 20 };

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