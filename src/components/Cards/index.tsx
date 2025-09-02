"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Cards.module.scss";
import { BsCart2 } from "react-icons/bs";
import { IoMdStar } from "react-icons/io";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

type CardsProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
};

export function Cards({ products, onAddToCart }: CardsProps) {
  return (
    <div className={styles.cardsWrapper}>
      <div className={styles.pageTitle}>Todos os produtos</div>

      {products.map((product) => (
        <div key={product.id} className={styles.cardContainer}>
          <div className={styles.cardImage}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
          <div className={styles.cardInfo}>
            <div className={styles.cardHeader}>
              <span className={styles.productName}>{product.name}</span>
              <span className={styles.productId}><IoMdStar size={20} color="#FFE100" />4.4</span>
            </div>
            <h3 className={styles.productTitle}>{product.name}</h3>
            <p className={styles.productDescription}>
              Camisa 100% algodão com corte moderno e acabamento premium...
            </p>
            <div className={styles.priceContainer}>
              <span className={styles.cardPrice}>
                {product.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className={styles.stock}>50 em estoque</span>
            </div>
            <button
              className={styles.addToCartButton}
              onClick={() => onAddToCart(product)}
            >
              <BsCart2 size={23} color="#FFFFFF" />
              <span className={styles.addToCartButtonText}>Adicionar</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
