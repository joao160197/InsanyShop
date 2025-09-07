"use client";

import React, { useState, useEffect } from "react";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    

    const cleanup = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach(el => el.removeAttribute('bis_skin_checked'));
    };
    
    cleanup();
    const timer = setTimeout(cleanup, 100);
    
    return () => clearTimeout(timer);
  }, []);


  return (
    <CartProvider>
      <div suppressHydrationWarning>
        {mounted ? (
          <>
            <Header />
            <main>{children}</main>
          </>
        ) : (
          <div style={{ display: 'none' }}>
            <Header />
            {children}
          </div>
        )}
      </div>
    </CartProvider>
  );
}
