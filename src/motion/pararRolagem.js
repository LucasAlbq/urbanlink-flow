// Pedidos pra parar a rolagem da página (menu do celular aberto, abertura tocando).
// O Lenis só volta a rolar quando o último pedido solta: um não destrava a página no meio
// do outro. Devolve a função que solta (pode chamar mais de uma vez).
const pedidos = new WeakMap()

export function pararRolagem(lenis) {
  pedidos.set(lenis, (pedidos.get(lenis) ?? 0) + 1)
  lenis.stop()

  let solto = false
  return function soltar() {
    if (solto) return
    solto = true
    const restam = pedidos.get(lenis) - 1
    pedidos.set(lenis, restam)
    if (restam === 0) lenis.start()
  }
}
