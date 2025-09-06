"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Cards.module.scss";
import { BsCart2 } from "react-icons/bs";
import { IoMdStar } from "react-icons/io";
import Link from "next/link";

import type { Product } from "@/types/api";

type CardsProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
  categoryName?: string;
};

export function Cards({ products, onAddToCart }: CardsProps) {
  return (
    <div className={styles.cardsWrapper}>

      {products.map((product) => (
        <div key={product.id} className={styles.cardContainer}>
          <Link href={`/product/${product.id}`} className={styles.cardImage}>
            {(() => {
              const raw = (product as any)?.image;
              const src = typeof raw === 'string' && raw.trim()
                ? raw
                : (raw && typeof raw === 'object' && typeof raw.url === 'string' && raw.url.trim())
                  ? raw.url
                  : '/image/image.png';
              const alt = product.name || 'Produto';
              return (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={100}
                  priority
                  style={{ objectFit: "cover" }}
                />
              );
            })()}
          </Link>
          <div className={styles.cardInfo}>
            <div className={styles.cardHeader}>
              <span className={styles.productName}>{product.brand || 'Marca'}</span>
              <span className={styles.productId}>
                <IoMdStar size={20} color="#FFE100" />
                {product.rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <Link href={`/product/${product.id}`} className={styles.productTitle}>
              {product.name}
            </Link>
            <p className={styles.productDescription}>
              {product.description || 'Descrição não disponível'}
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
              <span className={styles.stock}>
                {product.stock > 0 
                  ? `${product.stock} em estoque` 
                  : 'Fora de estoque'}
              </span>
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
