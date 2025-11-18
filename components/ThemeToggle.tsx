"use client";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // On mount, check and apply saved theme
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");

    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  // Prevents hydration issues
  if (!mounted) return null;

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors hover:bg-white/20 dark:hover:bg-black/20"
      aria-label="Toggle theme"
    >
      {darkMode ? (
        <span role="img" aria-label="Sun" className="text-yellow-400 text-2xl">
          ☀️
        </span>
      ) : (
        <span role="img" aria-label="Moon" className="text-blue-400 text-2xl">
          🌙
        </span>
      )}
    </button>
  );
}
