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
import GetFreeTime from "../components/freeTime";
import Header from "../components/header";

//?
import { type } from "os";
import { filterProps } from "framer-motion";

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

  //空き時間を取得する関数
  const GetFreeTime = (
    events: Array<{ startTime: string; endTime: string }>
  ) => {
    //全時間を分単位で計算
    const timeMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    //時刻形式の文字列（HH:mm）に変換
    const timeData = (minutes: number) => {
      //minutesの合計を60でわり何時間か取得→例：75/60=1.25
      //math.floorで小数点以下を切り捨て
      const hours = Math.floor(minutes / 60);
      //60で割ったあまりを分に変更→例：75分→75%60=15分
      const mins = minutes % 60;
      //hoursを文字列に変換→二桁未満の場合0を追加
      //minsも同じく
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}`;
    };

    //1日の終わりと始まり
    const dayStart = 0; //00:00
    const dayEnd = 1440; //24:00→1440分てことね

    //eventをstartTime順でソート
    const eventsSort = events
      .map((event) => ({
        start: timeMinutes(event.startTime),
        end: timeMinutes(event.endTime),
      }))
      .sort((a, b) => a.start - b.end);

    const freeTime = [];
    //現在までに処理したイベントの終了時刻を追跡→初期値は00:00
    let lastEnd = dayStart;

    for (const event of eventsSort) {
      if (lastEnd < event.start) {
        //前のイベントが終わってから（ない場合は1日の始まり）次のイベントが始まるまでの時間があればその時間をfreeTimeに追加
        freeTime.push({ start: timeData(lastEnd), end: timeData(event.start) });
      }
      //引数に含まれた数値のうち最大のものを取得しlastEndに入れてる
      //イベントの終了時刻をlastEndに上書き
      //イベント重複していても一番終わるのが遅いイベントの時間を考慮する！
      lastEnd = Math.max(lastEnd, event.end);
    }

    //dayEnd(24:00)までの空き時間を取得しfreeTimeに追加
    if (lastEnd < dayEnd) {
      freeTime.push({ start: timeData(lastEnd), end: timeData(dayEnd) });
    }

    return freeTime;

    // return <div></div>;
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
      <Header></Header>
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
                  {/* 空き時間を表示 */}
                  {date && (
                    <div className={styles.freeSlotsContainer}>
                      {GetFreeTime(
                        events.filter(
                          (event) =>
                            event.date ===
                            `${currentYear}-${String(currentMonth).padStart(
                              2,
                              "0"
                            )}-${String(date).padStart(2, "0")}`
                        )
                      ).map((slot, index) => (
                        <div key={index} className={styles.freeSlot}>
                          <p>
                            {slot.start} - {slot.end}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
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
  // return (
  //   <>
  //     <div className={styles.calenderContainer}>
  //       <div className={styles.weekdays}>
  //         {["日", "月", "火", "水", "木", "金", "土"].map((day) => {
  //           //日曜と土曜でクラス付与
  //           const dayClass =
  //             day === "日"
  //               ? styles.sunday
  //               : day === "土"
  //               ? styles.saturday
  //               : "";
  //           return (
  //             <div key={day} className={`${styles.weekday} ${dayClass}`}>
  //               {day}
  //             </div>
  //           );
  //         })}
  //       </div>

  //       <div className={styles.dates}>
  //         {dates.map((dateInfo, index) => {
  //           //dateinfoを分割して代入してる
  //           const { date, weekEnd, isSaturday, isSunday, isToday } = dateInfo;
  //           //空白を定数に定義
  //           // const displayDate = date || "";
  //           //日付がある場合とない場合でクラス名をそれぞれ付与
  //           //dateが空→dateOut
  //           //dateInの場合→weekEndがtrueならクラス付与
  //           const dateClass = date
  //             ? `${styles.dateIn} ${isSaturday ? styles.saturday : ""} ${
  //                 isSunday ? styles.sunday : ""
  //               } `
  //             : styles.dateOut;
  //           return (
  //             <div
  //               key={index}
  //               className={`${styles.date} ${
  //                 selectedDate ===
  //                 `${currentYear}-${String(currentMonth).padStart(
  //                   2,
  //                   "0"
  //                 )}-${String(date).padStart(2, "0")}`
  //                   ? styles.selected
  //                   : ""
  //               } ${dateClass}`}
  //               onClick={() => date && handleDateClick(date)}
  //             >
  //               <div className={styles.dateTopContainer}>
  //                 <div
  //                   className={`${styles.dateNum} ${
  //                     isToday ? styles.isToday : ""
  //                   }`}
  //                 >
  //                   {date}
  //                 </div>
  //               </div>
  //               <section className={styles.dateMainContainer}>
  //                 {/* //日付から一致する予定の日付をフィルタリング */}
  //                 {date &&
  //                   events
  //                     .filter((event) => {
  //                       //フォーマットを"YYYY-MM-DD"に
  //                       const formattedDate = `${currentYear}-${String(
  //                         currentMonth
  //                       ).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

  //                       //イベントをフィルタリング
  //                       const filterEvents = events.filter(
  //                         (event) => event.date === formattedDate
  //                       );

  //                       //空き時間を取得
  //                       const freeTime = GetFreeTime(filterEvents);
  //                       console.log(freeTime);

  //                       //イベントと空き時間を統合して共通フォーマットに変換
  //                       // const allSlots = [
  //                       //   ...filterEvents.map((event) => ({
  //                       //     type: "event",
  //                       //     start: event.startTime,
  //                       //     end: event.endTime,
  //                       //     title: event.title,
  //                       //   })),
  //                       //   ...freeTime.map((slot) => ({
  //                       //     type: "free",
  //                       //     start: slot.start,
  //                       //     end: slot.end,
  //                       //   })),
  //                       // ];

  //                       // //開始時間順でソート
  //                       // const sortSlots = allSlots.map((a, b) => {
  //                       //   const timeToMinutes = (time: string) => {
  //                       //     const [hours, minutes] = time
  //                       //       .split(":")
  //                       //       .map(Number);
  //                       //     return hours * 60 + minutes;
  //                       //   };
  //                       //   return (
  //                       //     timeToMinutes(a.start) - timeToMinutes(b.start)
  //                       //   );
  //                       // });
  //                       // return (
  //                       //   <>
  //                       //     {sortSlots.map((slot, index) => (
  //                       //       <div
  //                       //         key={index}
  //                       //         className={
  //                       //           slot.type === "event"
  //                       //             ? styles.eventContainer
  //                       //             : styles.freeSlotContainer
  //                       //         }
  //                       //       >
  //                       //         <p>
  //                       //           {slot.start} - {slot.end}
  //                       //         </p>
  //                       //         {slot.type === "event" && <p>{slot.title}</p>}
  //                       //       </div>
  //                       //     ))}
  //                       //   </>
  //                       // );
  //                     })
  //                     .map((event) => (
  //                       <div key={event.id} className={styles.eventContainer}>
  //                         <p>{event.title}</p>
  //                       </div>
  //                     ))}
  //                 {/* 空き時間を表示 */}
  //                 {/* {date && (
  //                   <div className={styles.freeSlotsContainer}>
  //                     {GetFreeTime(
  //                       events.filter(
  //                         (event) =>
  //                           event.date ===
  //                           `${currentYear}-${String(currentMonth).padStart(
  //                             2,
  //                             "0"
  //                           )}-${String(date).padStart(2, "0")}`
  //                       )
  //                     ).map((slot, index) => (
  //                       <div key={index} className={styles.freeSlot}>
  //                         <p>
  //                           {slot.start} - {slot.end}
  //                         </p>
  //                       </div>
  //                     ))}
  //                   </div>
  //                 )} */}
  //               </section>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>
  //     {showModal && selectedDate && (
  //       <SelectedDateModal
  //         setShowModal={setShowModal}
  //         selectedDate={selectedDate}
  //         events={events.filter((event) => event.date === selectedDate)}
  //       />
  //     )}

  //     <AddEventButton />
  //   </>
  // );
};

export default MainCalender;
