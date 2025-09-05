"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, setQuantity, clearCart, subtotal, shipping, total } = useCart();

  if (items.length === 0) {
    return (
      <main className="container" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Seu carrinho</h1>
        <p>Seu carrinho está vazio.</p>
        <Link href="/" style={{ color: "#115D8C", display: 'inline-block', marginTop: 12 }}>Voltar às compras</Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Seu carrinho</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <section style={{ display: 'grid', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
              <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}>
                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: '#666', fontSize: 14 }}>{item.brand}</div>
                <div style={{ marginTop: 8, fontWeight: 600 }}>
                  {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => setQuantity(item.id, Math.max(0, item.quantity - 1))} style={{ padding: '4px 8px' }}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => setQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 8px' }}>+</button>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ color: '#a00' }}>Remover</button>
              </div>
            </div>
          ))}
        </section>

        <aside style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, height: 'fit-content', position: 'sticky', top: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Resumo</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <strong>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Frete</span>
              <strong>{shipping.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 8 }}>
              <span>Total</span>
              <strong>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <button style={{ marginTop: 12, padding: '12px 16px', background: '#115D8C', color: '#fff', borderRadius: 8, border: 0, cursor: 'pointer' }}>
              Finalizar compra
            </button>
            <button onClick={clearCart} style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', cursor: 'pointer' }}>
              Limpar carrinho
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
