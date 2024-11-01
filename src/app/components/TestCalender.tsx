"use client";

import React from "react";

//fullcalenderからのimport
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

//data-fns
import { format } from "date-fns";

//日付をクリックした際にその日付をフォーマットとして表示する関数コンポーネント
//React.FCでpropsを受け取れる
const TestCalender: React.FC = () => {
  //argという引数を受け取る関数

  const handleDateClick = (arg: any) => {
    alert(`日付: ${format(new Date(arg.date), "yyyy-MM-dd")}`);
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      editable={true}
      selectable={true}
      dateClick={handleDateClick}
      events={[
        { title: "予定１", date: "2024-11-01" },
        { title: "予定2", date: "2024-11-03" },
      ]}
    />
  );
};

export default TestCalender;
