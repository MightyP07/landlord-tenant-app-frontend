// src/components/DarkModeToggle.jsx
import React, { useEffect, useState } from "react";
import "./DarkModeToggle.css";

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  return (
    <div className="dark-toggle">
      <input
        type="checkbox"
        id="darkSwitch"
        checked={darkMode}
        onChange={toggleTheme}
      />
      <label htmlFor="darkSwitch" className="toggle-label">
        <span className="toggle-ball">{darkMode ? "☀️" : "🌙"}</span>
      </label>
    </div>
  );
};

export default DarkModeToggle;
