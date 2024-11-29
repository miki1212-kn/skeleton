"use client";

import React, { useState, useEffect } from "react";
import styles from "./MainCalender.module.scss";
import { log } from "console";

//db
import { db } from "../../firebase";
import { query, collection, where, getDocs, addDoc } from "firebase/firestore";

//components
import AddEventButton from "../components/AddEventButton";
import SelectedDateModal from "../components/SelectedDateModal";
import { type } from "os";

const MainCalender: React.FC = () => {
  //timezoneを日本に設定し今日の日付を取得する関数
  const getToday = () => {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = formatter.formatToParts(new Date());
    const today = {
      //全部Number型でとってきてる
      year: Number(parts.find((part) => part.type === "year")?.value),
      month: Number(parts.find((part) => part.type === "month")?.value),
      date: Number(parts.find((part) => part.type === "day")?.value),
    };
    console.log("今日の日付は", today);

    return today;
  };
  //日本の今日
  const today = getToday();
  const [currentYear, setCurrentYear] = useState(today.year);
  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [dates, setDates] = useState<Array<number | null>>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [events, setEvents] = useState<Array<any>>([]); // Firestoreのイベントデータを格納

  //月毎に何日あるのか取得
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  //今月の日付を作成
  const generateDates = (year: number, month: number, day: number) => {
    const daysInMonth = getDaysInMonth(year, month - 1);
    //月の初日が何曜日か
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    console.log("今月は", firstDayOfMonth, "から始まる");

    //今日の日にち（dateのみ）取得
    const todayDate = today.date;
    console.log("今日は", todayDate, "日です");
    //yearの値が一致し、かつmonthも一致する
    const isThisMonth = year === today.year && month === today.month;
    // console.log(isThisMonth);

    const dates: Array<{
      date: number | null;
      weekEnd: boolean;
      isSaturday: boolean;
      isSunday: boolean;
      isToday: boolean;
    }> = [];

    //firstDayOfMonthで取得した、月の初日の曜日より前の部分を空白にする
    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push({
        date: null,
        weekEnd: false,
        isSaturday: false,
        isSunday: false,
        isToday: false,
      });
    }

    //実際の日付を挿入すると同時に、土日の取得と土曜日曜それぞれの取得
    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = new Date(year, month, i).getDay();

      const weekEnd = dayOfWeek === 0 || dayOfWeek === 6;
      const isSaturday = dayOfWeek === 1;
      // console.log(isSaturday);

      const isSunday = dayOfWeek === 2;
      //今日の日(todayDate)とisThisMonthがtrue
      const isToday = isThisMonth && i === todayDate;
      dates.push({ date: i, weekEnd, isSaturday, isSunday, isToday });
      // console.log(weekEnd); //ちゃんととれてる！
      // console.log(i, "土曜日？", isSaturday); //ちゃんととれてる！
    }

    return dates;
  };

  //firestoreから予定データ取得する関数
  const fetchEvents = async () => {
    // //開始日と終了日
    // const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    // const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(
    //   year,
    //   month,
    //   0
    // ).getDate()}`;

    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const fetchEvents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("取得した予定データ", fetchEvents);

      setEvents(fetchEvents);
    } catch (error) {
      console.error("予定データ取得失敗", error);
    }
    // //firestoreのクエリ
    // const q = query(
    //   collection(db, "events"),
    //   where("date", ">=", startDate),
    //   where("date", "<=", endDate)
    // );

    //データ取得
    // const querySnapshot = await getDocs(q);
    // const events: {
    //   [key: string]: Array<{
    //     id: string;
    //     title: string;
    //     startTime: string;
    //     endTime: string;
    //   }>;
    // } = {};

    // querySnapshot.forEach((doc) => {
    //   const data = doc.data();
    //   console.log(data);
    //   const date = data.date; //"YYYY-MM-DD"
    //   if (!events[date]) {
    //     events[date] = [];
    //   }
    //   events[date].push({
    //     id: doc.id,
    //     title: data.title,
    //     startTime: data.startTime,
    //     endTime: data.endTime,
    //   });
    // });
    // return events;
  };

  //useEffect ----------------------------------------------
  // useEffectで管理
  useEffect(() => {
    setDates(generateDates(currentYear, currentMonth));
    // const generatedDates = generateDates(currentYear, currentMonth);
    // setDates(generatedDates);
    //   const events = await fetchEventsForMonth(currentYear, currentMonth);
    //   console.log("firestoreから取得した予定のデータ:", events);
    //   //カレンダーに日付データをマージ
    //   const updateDates = generateDates.map((dateInfo) => {
    //     if (dateInfo.date) {
    //       const fullDate = `${currentYear}-${String(currentMonth).padStart(
    //         2,
    //         "0"
    //       )}-${String(dateInfo.date).padStart(2, "0")}`;
    //       return { ...dateInfo, events: events[fullDate] || [] };
    //     }
    //     return { ...dateInfo, events: [] };
    //   });

    //   setDates(updateDates);
    // };
    // fetchAndSetEvents();
  }, [currentYear, currentMonth]); // currentYear や currentMonth が変更されたときに再実行

  //予定データ取得
  useEffect(() => {
    fetchEvents();
  }, []);

  //クリックした日付取得の関数
  const handleDateClick = (date: number) => {
    // selectedDateを"YYYY-MM-DD"の形式に変更
    const formattedDate = `${currentYear}-${String(currentMonth).padStart(
      2,
      "0"
    )}-${String(date).padStart(2, "0")}`;
    setSelectedDate(formattedDate);
    //クリックした日
    console.log("クリックした日", formattedDate);

    const [selectedYear, selectedMonth, selectedDay] = formattedDate
      .split("-")
      .map(Number);
    console.log("selectedYear:", selectedYear);
    console.log("selectedMonth:", selectedMonth);
    console.log("selectedDay:", selectedDay);

    setShowModal(true); // モーダルを表示
  };

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
    <>
      <div className={styles.calenderContainer}>
        <div className={styles.weekdays}>
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => {
            //日曜と土曜でクラス付与
            const dayClass =
              day === "日"
                ? styles.sunday
                : day === "土"
                ? styles.saturday
                : "";
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
            const { date, weekEnd, isSaturday, isSunday, isToday } = dateInfo;
            //空白を定数に定義
            // const displayDate = date || "";
            //日付がある場合とない場合でクラス名をそれぞれ付与
            //dateが空→dateOut
            //dateInの場合→weekEndがtrueならクラス付与
            const dateClass = date
              ? `${styles.dateIn} ${isSaturday ? styles.saturday : ""} ${
                  isSunday ? styles.sunday : ""
                } `
              : styles.dateOut;
            return (
              <div
                key={index}
                className={`${styles.date} ${
                  selectedDate ===
                  `${currentYear}-${String(currentMonth).padStart(
                    2,
                    "0"
                  )}-${String(date).padStart(2, "0")}`
                    ? styles.selected
                    : ""
                } ${dateClass}`}
                onClick={() => date && handleDateClick(date)}
              >
                <div className={styles.dateTopContainer}>
                  <div
                    className={`${styles.dateNum} ${
                      isToday ? styles.isToday : ""
                    }`}
                  >
                    {date}
                  </div>
                </div>
                <section className={styles.dateMainContainer}>
                  {/* //日付から一致する予定の日付をフィルタリング */}
                  {date &&
                    events
                      .filter((event) => {
                        //フォーマットを"YYYY-MM-DD"に
                        const formattedDate = `${currentYear}-${String(
                          currentMonth
                        ).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

                        return event.date === formattedDate;
                      })
                      .map((event) => (
                        <div key={event.id} className={styles.eventContainer}>
                          <p>{event.title}</p>
                        </div>
                      ))}
                </section>
              </div>
            );
          })}
        </div>
      </div>
      {showModal && selectedDate && (
        <SelectedDateModal
          setShowModal={setShowModal}
          selectedDate={selectedDate}
          events={events.filter((event) => event.date === selectedDate)}
        />
      )}

      <AddEventButton />
    </>
  );
};

export default MainCalender;
