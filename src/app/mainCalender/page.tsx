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

    // 実際の日付を挿入
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i);
    }
    return dates;
  };

  const dates = generateDates(currentYear, currentMonth);

  // 月名リスト
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return (
    <div className={styles.calenderContainer}>
      <div className={styles.weekdays}>
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.dates}>
        {dates.map((date, index) => (
          <div key={index} className={styles.date}>
            {date || ""}
          </div>
        ))}
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
