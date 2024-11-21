// "use client";

// import React, { useState, useEffect } from "react";
// import styles from "./AddEventButton.module.scss";
// import { log } from "console";
// //db
// import { db } from "../../firebase";
// import { collection, addDoc } from "firebase/firestore";

// //components
// import AddEventModal from "./AddEventModal";

// //icon
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPlus } from "@fortawesome/free-solid-svg-icons";

// const AddEventButton: React.FC = () => {
//   const [showModal, setShowModal] = useState<boolean>(false);
//   const btnClick = () => {
//     setShowModal(true);
//   };

//   return (
//     <div className={styles.addBtnContainer}>
//       <button className={styles.addBtn} onClick={btnClick}>
//         <FontAwesomeIcon className={styles.plus} icon={faPlus} />
//       </button>
//       {showModal && <AddEventModal setShowModal={setShowModal} />}
//     </div>
//   );
// };
// export default AddEventButton;

"use client";

import React, { useState, useEffect } from "react";
import styles from "./AddEventButton.module.scss";
import { log } from "console";
//db
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

//components
import AddEventModal from "./AddEventModal";

//icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

//animation
import { AnimatePresence } from "framer-motion";

const AddEventButton: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <div className={styles.addBtnContainer}>
      {/* showModalがfalseのときのみボタンを表示 */}

      <AnimatePresence>
        {!showModal && (
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            <FontAwesomeIcon className={styles.plus} icon={faPlus} />
          </button>
        )}

        {/* showModalがtrueの場合、モーダルを表示 */}
        {showModal && (
          <AddEventModal setShowModal={setShowModal} key="add-event-modal" />
        )}
      </AnimatePresence>
    </div>
  );
};
export default AddEventButton;
