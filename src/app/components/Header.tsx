// import React from "react";

interface headerToolBarProps {
  left: string;
  center: string;
  right: string;
}

// 「 headerToolBar 」という名前のコンポーネントを作成する
const headerToolBar: React.FC<headerToolBarProps> = ({ left, center, right }) => {
  return (
    // headerToolbar コンポーネントがオブジェクトではなく、実際に JSX を返すようにする
    <div className="header-toolbar">
      <div className="left">{left}</div>
      <div className="center">{center}</div>
      <div className="right">{right}</div>
    </div>
  );
};

export default headerToolBar;