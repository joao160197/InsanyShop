"use client";

import Link from "next/link";
import styles from "./Header.module.scss";
import { FiShoppingBag } from "react-icons/fi";
import { PiMagnifyingGlassThin } from "react-icons/pi";
import { useState } from "react";

export default function Header() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.Title}>
            <Link href="/">InsanyShop</Link>
          </div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.searchContainer}>
            <input
              className={styles.input}
              type="text"
              placeholder="Procurando por algo específico?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className={styles.searchButton} type="submit">
            <PiMagnifyingGlassThin size={24} color={"#737380"}/>
            </button>
          </div>
          <Link href="/cart">
            <button className={styles.button} onClick={() => setSearch("")} type="button">
            <FiShoppingBag size={24} color={"#737380"}/>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
