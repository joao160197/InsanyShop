"use client";

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

export function Cards({ products, onAddToCart, categoryName }: CardsProps) {
  const getProductImage = (product: Product) => {
    const raw = (product as any)?.image;
    if (typeof raw === 'string' && raw.trim()) return raw;
    if (raw && typeof raw === 'object' && typeof raw.url === 'string' && raw.url.trim()) {
      return raw.url;
    }
    return '/image/image.png';
  };

  return (
    <div className={styles.cardsWrapper}>
      {products.map((product) => (
        <div key={product.id} className={styles.cardContainer}>
          <Link href={`/product/${product.id}`} className={styles.cardImage}>
            <Image
              src={getProductImage(product)}
              alt={product.name || 'Produto'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={100}
              style={{ objectFit: 'cover' }}
            />
          </Link>
          
          <div className={styles.cardInfo}>
            <div className={styles.cardHeader}>
              <h2 className={styles.productName}>{product.brand || 'Marca'}</h2>
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
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2
                }).format(product.price)}
              </span>
              
              <span className={styles.stock}>
                {product.stock > 0 
                  ? `${product.stock} em estoque` 
                  : 'Fora de estoque'}
              </span>
            </div>
            
            <div className={styles.cardFooter}>
              <button 
                className={styles.addToCartButton}
                onClick={() => onAddToCart(product)}
              >
                <BsCart2 size={25} />
                <span className={styles.addToCartButtonText}>Adicionar</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
