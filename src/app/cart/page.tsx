"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import styles from "./CartPage.module.scss";

export default function CartPage() {
  const { items, removeItem, setQuantity,subtotal, shipping, total } = useCart();

  if (items.length === 0) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Seu carrinho</h1>
        <p>Seu carrinho está vazio.</p>
        <a href="/" className={styles.backLink}>Voltar às compras</a>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Seu carrinho</h1>

      <div className={styles.grid}>
        {/* Lista de itens */}
        <section className={styles.items}>
          {items.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={100}
                  priority
                  style={{ objectFit: 'cover' }} 
                />
              </div>
              <div className={styles.info}>
                <h3>{item.name}</h3>
                <p className={styles.brand}>{item.brand}</p>
                <p className={styles.description}>
                  Aqui vem um texto descritivo do produto, esta caixa de texto servirá
                  apenas de exemplo para simular algum texto que venha a ser inserido.
                </p>
                <div className={styles.actions}>
                  <select
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button onClick={() => removeItem(item.id)} className={styles.trash}>
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className={styles.price}>
                {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          ))}
        </section>

        {/* Resumo */}
        <aside className={styles.summary}>
          <h2>Resumo do pedido</h2>
          <div className={styles.row}>
            <span>Subtotal de produtos</span>
            <strong>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          </div>
          <div className={styles.row}>
            <span>Entrega</span>
            <strong>{shipping.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          </div>
          <div className={`${styles.row} ${styles.total}`}>
            <span>Total</span>
            <strong>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          </div>

          <button className={styles.buyBtn}>Finalizar a compra</button>
         

          <div className={styles.links}>
            <a href="#">Ajuda</a>
            <a href="#">Reembolsos</a>
            <a href="#">Entregas e frete</a>
            <a href="#">Trocas e devoluções</a>
          </div>
        </aside>
      </div>
    </main>
  );
}
