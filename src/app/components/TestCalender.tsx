"use client";

import React from "react";
import { useEffect, useState } from "react";

//fullcalenderからのimport
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
// import ja from "../locales/ja";a

import styles from "./MainCalender.module.scss";
//日付をクリックした際にその日付をフォーマットとして表示する関数コンポーネント

import { format } from "date-fns";
//React.FCでpropsを受け取れる
const TestCalender: React.FC = () => {
  const [isSixRows, setIsSixRows] = useState(false);

  // カレンダーの行数を判定
  const handleDatesSet = () => {
    const weeks = document.querySelectorAll(".fc-daygrid-week");
    setIsSixRows(weeks.length === 6); // 行数が6の場合は true に設定
  };

  //argという引数を受け取る関数

  const handleDateClick = (arg: any) => {
    alert(`日付: ${format(new Date(arg.date), "yyyy-MM-dd")}`);
  };

  return (
    <div
      className={`${styles.calenderContainer} ${
        isSixRows ? styles.sixRows : styles.fiveRows
      }`}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        editable={true} //イベントのドラッグ操作を許可
        selectable={true} //日付選択を許可
        dateClick={handleDateClick} //日付クリックのイベントハンドラ
        businessHours={true}
        // showNonCurrentDates={false}
        datesSet={handleDatesSet}
        // height="660px"
        // locale={ja}
        events={[
          { title: "予定１", date: "2024-11-01" },
          { title: "予定2", date: "2024-11-03" },
        ]}
      />
    </div>
  );
};

export default TestCalender;
