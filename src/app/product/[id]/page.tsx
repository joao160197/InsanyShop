'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { fetchProductById } from '@/services/api';
import type { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';

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

  if (loading) return <main className="container" style={{ padding: 24 }}>Carregando produto...</main>;
  if (error) return <main className="container" style={{ padding: 24 }}><p>{error}</p></main>;
  if (!product) return <main className="container" style={{ padding: 24 }}>Produto não encontrado.</main>;

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
    <main className="container" style={{ padding: 24 }}>
      <button onClick={() => router.back()} aria-label="Voltar" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#737380', background: 'transparent', border: 0, cursor: 'pointer', marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>↩</span>
        <span>Voltar</span>
      </button>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', background: '#f2f2f2' }}>
          <Image src={resolvedImageSrc} alt={product.name || 'Produto'} fill style={{ objectFit: 'cover' }} />
        </div>
        <section>
          <div style={{ color: '#737380', marginBottom: 8 }}>{product.category || 'Categoria'}</div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>{product.name}</h1>
          <div style={{ color: '#0F9D58', fontWeight: 700, marginBottom: 24 }}>
            {priceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>

          <h2 style={{ fontSize: 14, color: '#737380', letterSpacing: 1, marginBottom: 8 }}>DESCRIÇÃO</h2>
          <p style={{ marginBottom: 24, color: '#4F4F4F' }}>{descriptionText}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ color: stockValue > 0 ? '#0a0' : '#a00' }}>
              {stockValue > 0 ? `${stockValue} em estoque` : 'Fora de estoque'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, maxWidth: 420 }}>
            <button
              onClick={() => addItem({ ...product, price: priceValue, stock: stockValue })}
              disabled={stockValue <= 0}
              style={{ padding: '14px 16px', background: '#000', color: '#fff', borderRadius: 8, border: 0, cursor: 'pointer', fontWeight: 600 }}
            >
              Adicionar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
