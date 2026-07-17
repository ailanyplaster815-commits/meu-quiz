export interface Usuario {
  uid?: string;
  nome?: string;
  email: string;
  foto?: string;
  origem: "email" | "google";
}

export function salvarUsuario(usuario: Usuario) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function obterUsuario(): Usuario | null {
  const usuario = localStorage.getItem("usuario");

  if (!usuario) return null;

  return JSON.parse(usuario);
}

export function removerUsuario() {
  localStorage.removeItem("usuario");
}

export function salvarFormulario(dados: unknown) {
  localStorage.setItem("formulario", JSON.stringify(dados));
}

export function obterFormulario() {
  const dados = localStorage.getItem("formulario");

  return dados ? JSON.parse(dados) : null;
}

export function salvarPedido(dados: unknown) {
  localStorage.setItem("pedido", JSON.stringify(dados));
}

export function obterPedido() {
  const dados = localStorage.getItem("pedido");

  return dados ? JSON.parse(dados) : null;
}

export function limparFunil() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("formulario");
  localStorage.removeItem("pedido");
}