'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { fetchProductById } from '@/services/api';
import type { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';
import styles from './page.module.scss';
import { TbArrowBackUp } from "react-icons/tb";
import { BsCart2 } from "react-icons/bs";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar produto');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <main className={styles.container}>Carregando produto...</main>;
  if (error) return <main className={styles.container}><p>{error}</p></main>;
  if (!product) return <main className={styles.container}>Produto não encontrado.</main>;

  // Normaliza campos potencialmente divergentes vindos da API
  const priceValue = Number((product as any)?.price ?? 0);
  const stockValue = Number((product as any)?.stock ?? 0);
  const descriptionText = (product as any)?.description ?? '';
  const rawImage: any = (product as any)?.image;
  const resolvedImageSrc: string =
    typeof rawImage === 'string' && rawImage.trim()
      ? rawImage
      : (rawImage && typeof rawImage === 'object' && typeof rawImage.url === 'string' && rawImage.url.trim())
        ? rawImage.url
        : '/image/image.png'; // placeholder local em public/image/

  return (
    <main className={styles.container}>
      <div className={styles.backButtonContainer}>
        <button 
          onClick={() => router.back()} 
          aria-label="Voltar" 
          className={styles.backButton}
        >
          <span className={styles.backIcon}><TbArrowBackUp size={15} /></span>
          <span>Voltar</span>
        </button>
      </div>

      <div className={styles.productContainer}>
        <div className={styles.imageContainer}>
          <Image 
            src={resolvedImageSrc} 
            alt={product.name || 'Produto'} 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={100}
            priority
            className={styles.productImage}
          />
        </div>
        <section className={styles.productInfo}>
          <div className={styles.category}>{product.category || 'Categoria'}</div>
          <h1 className={styles.title}>{product.name}</h1>
          <div className={styles.price}>
            {priceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>

          <h2 className={styles.sectionTitle}>DESCRIÇÃO</h2>
          <p className={styles.description}>{descriptionText}</p>

          <div className={styles.actions}>
            <button
              onClick={() => addItem({ ...product, price: priceValue, stock: stockValue })}
              disabled={stockValue <= 0}
              className={styles.addToCartButton}
            >
            <BsCart2 size={25} /> Adicionar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
