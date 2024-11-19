"use client";

import React, { useState, useEffect } from "react";
import styles from "./MainCalender.module.scss";
import { log } from "console";

//db
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

//components
import AddEventButton from "../components/AddEventButton";

const MainCalender: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [dates, setDates] = useState<Array<number | null>>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); //選択した日付
  const [showModal, setShowModal] = useState(false);

  //月毎に何日あるのか取得
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  //今月の日付を作成
  const generateDates = (year: number, month: number, day: number) => {
    const daysInMonth = getDaysInMonth(year, month, day);
    //月の初日が何曜日か
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const dates: Array<{
      date: number | null;
      weekEnd: boolean;
      isSaturday: boolean;
      isSunday: boolean;
    }> = [];

    //firstDayOfMonthで取得した、月の初日の曜日より前の部分を空白にする
    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push({
        date: null,
        weekEnd: false,
        isSaturday: false,
        isSunday: false,
      });
    }

    //実際の日付を挿入すると同時に、土日の取得と土曜日曜それぞれの取得
    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = new Date(year, month, i).getDay();
      const weekEnd = dayOfWeek === 0 || dayOfWeek === 6;
      const isSaturday = dayOfWeek === 6;
      const isSunday = dayOfWeek === 0;
      dates.push({ date: i, weekEnd, isSaturday, isSunday });
      // console.log(weekEnd); //ちゃんととれてる！
      console.log(i, "土曜日？", isSaturday);
    }

    return dates;
  };

  // useEffectで管理
  useEffect(() => {
    const generatedDates = generateDates(
      currentYear,
      currentMonth,
      today.getDate()
    );
    setDates(generatedDates);
  }, [currentYear, currentMonth]); // currentYear や currentMonth が変更されたときに再実行

  // const handleDateClick = (date: number) => {
  //   setSelectedDate(`${currentYear}-${currentMonth + 1}-${date}`);
  //   setShowModal(true); // モーダルを表示
  // };

  // const dates = generateDates(currentYear, currentMonth);

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
          //日曜と土曜でクラス付与
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
        {dates.map((dateInfo, index) => {
          //dateinfoを分割して代入してる
          const { date, weekEnd, isSaturday, isSunday } = dateInfo;
          //空白を定数に定義
          // const displayDate = date || "";
          //日付がある場合とない場合でクラス名をそれぞれ付与
          //dateが空→dateOut
          //dateInの場合→weekEndがtrueならクラス付与
          const dateClass = date
            ? `${styles.dateIn} ${isSaturday ? styles.saturday : ""} ${
                isSunday ? styles.sunday : ""
              }`
            : styles.dateOut;
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

export default MainCalender;
