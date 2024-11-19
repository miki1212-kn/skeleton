"use client";

import React, { useState, useEffect } from "react";
import styles from "./AddEventButton.module.scss";
import { log } from "console";
//db
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

//components
import AddEventModal from "./AddEventModal";

const AddEventButton: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const btnClick = () => {
    setShowModal(true);
  };

  return (
    <div className={styles.addBtnContainer}>
      <button className={styles.addBtn} onClick={btnClick}>
        +
      </button>
      {showModal && <AddEventModal setShowModal={setShowModal} />}
    </div>
  );
};
export default AddEventButton;
