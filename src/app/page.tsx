"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1 className={styles.appName}>skeleton</h1>
      <Link className={styles.btn} href={`/MainCalender`}>
        Go to MyCalender
      </Link>
    </div>
  );
}
