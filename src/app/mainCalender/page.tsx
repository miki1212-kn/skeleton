"use client";

import React, { useState } from "react";
import styles from "./MainCalender.module.scss";

const MainCalender: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  //月毎に何日あるのか取得
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  //今月の日付を作成
  const generateDates = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    //月の初日が何曜日なのか
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const dates: Array<number | null> = [];

    //firstDayOfMonthで取得した、月の初日の曜日より前の部分を空白にする
    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(null);
    }

    // 実際の日付を挿入
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i);
    }
    return dates;
  };

  const dates = generateDates(currentYear, currentMonth);

  // 月名リスト
  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];
  return (
    <div className={styles.calenderContainer}>
      <div className={styles.weekdays}>
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => {
          const dayClass =
            day === "日" ? styles.sunday : day === "土" ? styles.saturday : "";
          return (
            <div key={day} className={`${styles.weekday} ${dayClass}`}>
              {day}
            </div>
          );
        })}
      </div>

      <div className={styles.dates}>
        {dates.map((date, index) => {
          //空白を定数に定義
          const displayDate = date || "";
          //日付がある場合とない場合でクラス名をそれぞれ付与
          //dateが空→dateOut 日付あり→dateIn
          const dateClass = displayDate ? styles.dateIn : styles.dateOut;
          return (
            <div key={index} className={`${styles.date} ${dateClass}`}>
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// export default function MainCalender() {
//   return (
//     <>
//       <h1>カレンダーページ</h1>
//     </>
//   );
// }

export default MainCalender;
