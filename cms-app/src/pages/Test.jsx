import React, { useState, useEffect } from "react";

const Test = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      console.log("scrollY:", window.scrollY);
      setVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div>
      <div className="h-[2000px] bg-gradient-to-b from-white to-gray-200 p-10">
        <h1 className="text-4xl font-bold">Scroll Down</h1>
      </div>
      {visible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Test;
