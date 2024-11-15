"use client";

import React, { useRef } from "react";
import { useEffect, useState } from "react";

//fullcalenderからのimport
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Headerで作成した「 headerToolBar 」という名前のコンポーネントを持ってくる
// ここに書いただけやったらエラー出る、下もしっかり書こう
import headerToolBar from "./Header";

import styles from "./MainCalender.module.scss";

const HeaderContainer: React.FC = () => {
  const CalenderRef = useRef<FullCalendar>(null);

  // 年変更用のモーダルを開く（例として `prompt` を使用）
  const changeYear = () => {
    const newYear = prompt("Enter a new year:");
    if (newYear && CalenderRef.current) {
      const calendarApi = CalenderRef.current.getApi();
      calendarApi.gotoDate(`${newYear}-01-01`); // 年を変更
    }
  };

  // 月変更用のモーダルを開く（例として `prompt` を使用）
  const changeMonth = () => {
    const newMonth = prompt("Enter a new month (1-12):");
    if (newMonth && CalenderRef.current) {
      const calendarApi = CalenderRef.current.getApi();
      const currentYear = calendarApi.getDate().getFullYear();
      calendarApi.gotoDate(`${currentYear}-${newMonth.padStart(2, "0")}-01`); // 月を変更
    }
  };

  return (
    <FullCalendar
      ref={CalenderRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "customYear",
        center: "customMonth",
        right: "customSearch customMenu",
      }}
      customButtons={{
        customYear: {
          text: "2024", // 初期の年を入れておく
          click: () => changeYear(),
        },
        customMonth: {
          text: "11月", // 初期の月を入れておく
          click: () => changeMonth(),
        },
        customSearch: {
          text: "🔍", // アイコンを入れておく
          click: () => alert("Search clicked!"),
        },
        customMenu: {
          text: "☰", // ハンバーガーメニュー
          click: () => alert("Menu clicked!"),
        },
      }}
      datesSet={(info) => {
        const calendarApi = CalenderRef.current?.getApi();
        const currentYear = info.view.currentStart.getFullYear();
        const currentMonth = info.view.currentStart.toLocaleString("default", {
          month: "long",
        });

        // 年と月をカスタムボタンに反映
        const yearButton = calendarApi?.toolbarEl.querySelector(
          ".fc-customYear-button"
        );
        const monthButton = calendarApi?.toolbarEl.querySelector(
          ".fc-customMonth-button"
        );
        if (yearButton) yearButton.textContent = currentYear.toString();
        if (monthButton) monthButton.textContent = currentMonth;
      }}
    />
  );
};

export default HeaderContainer;
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

// export default TestCalender;
