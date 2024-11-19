"use client";

import React, { useState, useEffect } from "react";
import styles from "./AddEventModal.module.scss";
import { log } from "console";
//db
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

interface AddEventModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ setShowModal }) => {
  const [eventTtl, setEventTtl] = useState<string>(""); //予定のタイトル
  const [isAllday, setIsAllday] = useState<boolean>(false); //終日かどうか
  const [startDate, setStartDate] = useState<string | null>(null); // 開始日時
  const [endDate, setEndDate] = useState<string | null>(null); // 終了日時
  const [eventColor, setEventColor] = useState<string>("red"); // 予定のカラー
  const [memo, setMemo] = useState<string>(""); // メモ
  const [history, setHistory] = useState<string>(""); // 履歴

  //予定をfirestoreに追加する関数
  // const addEvent = async () => {
  //   if (!selectedDate || !eventTtl || (!isAllday && !startDate) || endDate)
  //     return;

  //   try {
  //     await addDoc(collection(db, "events"), {
  //       title: eventTtl,
  //       isAllday,
  //       startDate,
  //       endDate,
  //       color: eventColor,
  //       memo,
  //       history,
  //       date: selectedDate,
  //     });
  //     setShowModal(false); //モーダルをとじる
  //     alert("予定が追加されました！");
  //   } catch (e) {
  //     console.error("error : 追加に失敗", e);
  //   }
  // };

  const handleSubmit = async () => {
    if (!title) return; // タイトルが入力されていない場合は保存しない

    try {
      await addDoc(collection(db, "events"), {
        title,
        isAllday,
        startDate: isAllDay ? null : startDate, // 終日設定の場合、startDateとendDateをnullにする
        endDate: isAllDay ? null : endDate,
        color,
        memo,
        history,
        date: new Date().toISOString().split("T")[0], // 現在の日付を保存
      });
      setShowModal(false); // モーダルを閉じる
      alert("予定が追加されました！");
    } catch (error) {
      console.error("予定の追加に失敗:", error);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <header>
          <button onClick={addEvent}>保存</button>

          <h2>新しい予定</h2>
          <button onClick={() => setShowModal(false)}>キャンセル</button>
        </header>
        <input
          type="text"
          placeholder="Event Title"
          value={eventTtl}
          onChange={(e) => setEventTtl(e.target.value)}
        />
        {}

        <label>
          終日:
          <input
            type="checkbox"
            checked={isAllday}
            onChange={() => setInAllday(!isAllday)}
          />
        </label>

        {/* 終日じゃない場合の日時入力 */}
        {!isAllday && (
          <div>
            <input
              type="datetime-local"
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value)}
            />
            ～
            <input
              type="datetime-local"
              value={endDate || ""}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}

        {/* 履歴 */}
        <input
          type="text"
          value={history}
          onChange={(e) => setHistory(e.target.value)}
        />

        {/* 予定のカラー */}
        <select
          value={eventColor}
          onChange={(e) => setEventColor(e.target.value)}
        >
          <option value="red">赤</option>
          <option value="blue">青</option>
          <option value="green">緑</option>
          <option value="yellow">黄</option>
          <option value="purple">紫</option>
          <option value="orange">オレンジ</option>
        </select>

        {/* メモ */}
        <textarea
          placeholder="メモ"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AddEventModal;
