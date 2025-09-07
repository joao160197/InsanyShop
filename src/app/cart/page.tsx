"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineTrash } from "react-icons/hi2";
import { TbArrowBackUp } from "react-icons/tb";
import styles from "./CartPage.module.scss";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, setQuantity, subtotal, shipping, total } = useCart();

  if (items.length === 0) {
    return (
      <main className={styles.containerEmpty}>
        <h1 className={styles.title}>Seu carrinho</h1>
        <p className={styles.emptyText}>Seu carrinho está vazio.</p>
        <Link href="/" className={styles.backLink}>Voltar às compras</Link>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.backButtonContainer}>
        <button 
          onClick={() => router.back()} 
          aria-label="Voltar" 
          className={styles.backButton}
        >
          <span className={styles.backIcon}>  <TbArrowBackUp size={15} /></span>
          Voltar
        </button>
      </div>
      <h1 className={styles.title}>Seu carrinho</h1>
      <p className={styles.subtotal}>
        Total ({items.reduce((total, item) => total + item.quantity, 0)} produto{items.reduce((total, item) => total + item.quantity, 0) !== 1 ? 's' : ''}) R$
        <span className={styles.subtotalValue}>{subtotal.toFixed(2).replace('.', ',')}</span>
      </p>

      <div className={styles.grid}>
        <section className={styles.items}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imagePanel}>
                <Image
                  src={typeof item.image === 'string' ? item.image : item.image.url}
                  alt={item.name}
                  fill
                  quality={100}
                  priority
                  sizes="(max-width: 768px) 100vw, 260px"
                  style={{ objectFit: "cover" }}
                />
              </div>

             
              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.productTitle}>{item.name}</h3>
                  <button
                    aria-label="Remover item do carrinho"
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                  >
                    <HiOutlineTrash  size={25}/>
                  </button>
                </div>
                <div className={styles.textBlock}>
                  <p className={styles.description}>
                    Aqui vem um texto descritivo do produto, esta caixa de texto servirá
                    apenas de exemplo para simular algum texto que venha a ser inserido
                    nesse campo, descrevendo tal produto.
                  </p>
                </div>

                <div className={styles.footer}>
                  <div className={styles.actions}>
                    <select
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.price}>
                    {item.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className={styles.summary}>
          <h2>Resumo do pedido</h2>
          <div className={styles.row}>
            <span className={styles.rowText}>Subtotal de produtos</span>
            <strong>
              <span className={styles.rowText}>{subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </strong>
          </div>
          <div className={styles.row}>
            <span className={styles.rowText}>Entrega</span>
            <strong>
              <span className={styles.rowText}>{shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </strong>
          </div>
          <div className={`${styles.row} ${styles.total}`}>
            <span>Total</span>
            <strong>
              {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>
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
