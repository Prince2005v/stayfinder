"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

interface UserProfile {
  name: string;
  user_type: string; // guest | host
}

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // ✅ Load token + user data
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);

    // ✅ Fetch user profile
    fetch("http://127.0.0.1:5000/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user_profile) {
          setUser({
            name: data.user_profile.name,
            user_type: data.user_profile.user_type,
          });
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUser(null);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-50">
      
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        StayFinder
      </Link>

      {/* Navigation Links */}
      <ul className="hidden md:flex gap-8 text-gray-700 dark:text-gray-200 font-medium">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/hotels">Hotels</Link></li>
        <li><Link href="/offers">Offers</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>

      {/* Right section */}
      <div className="flex items-center gap-3">

        {/* ✅ NOT LOGGED IN */}
        {!isLoggedIn && (
          <>
            <Link
              href="/signin"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Register
            </Link>
          </>
        )}

        {/* ✅ LOGGED IN (Guest or Host) */}
        {isLoggedIn && user && (
          <>
            {/* ✅ Show Welcome Name */}
            <span className="font-semibold dark:text-white max-sm:hidden">
              Hi, {user.name.split(" ")[0]}
            </span>

            {/* ✅ Profile Button */}
            <Link
              href="/profile"
              className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Profile
            </Link>

            {/* ✅ Host Only: Register Hotel */}
            {/* {user.user_type === "host" && (
              <Link
                href="/register-host"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Register Hotel
              </Link>
            )} */}

            {/* ✅ Logout Button */}
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </>
        )}

        <ThemeToggle />
      </div>
    </nav>
  );
}
