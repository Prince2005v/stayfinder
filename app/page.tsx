"use client";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import HotelCard from "../components/HotelCard";
import Footer from "../components/Footer";
import Chatbot from "@/components/Chatbot"; // ✅ Chatbot import
import { useEffect, useState } from "react";

interface UserProfile {
  name: string;
  user_type: string; // guest | host
}

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);

  // ✅ Load user profile if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://127.0.0.1:5000/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user_profile) {
          setUser({
            name: data.user_profile.name,
            user_type: data.user_profile.user_type,
          });
        }
      });
  }, []);

  const hotels = [
    {
      id: 1,
      name: "The Royal Orchid",
      img: "/hotel1.jpg",
      desc: "Luxury rooms with city views, gym & restaurant. Ideal for monthly stays.",
    },
    {
      id: 2,
      name: "Comfort Suites",
      img: "/hotel2.jpg",
      desc: "Affordable comfort with Wi-Fi and daily housekeeping.",
    },
    {
      id: 3,
      name: "Urban Stay",
      img: "/hotel3.jpg",
      desc: "Cozy boutique hotel for professionals — flexible long-term plans.",
    },
  ];

  return (
    <main
      className="text-gray-900 dark:text-white min-h-screen"
      style={{
        background: "bg-[#0F172A] dark:bg-[#111827]",
      }}
    >
      <Navbar />
      <HeroSection />

      {/* ✅ Host Quick Navigation Section */}
      {user?.user_type === "host" && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6">Host Dashboard</h2>
          <p className="text-gray-200 mb-8">
            Welcome back <span className="font-semibold">{user.name}</span> — manage your hotels, rooms, and bookings easily.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
              href="/register-hotel"
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-lg text-center transition-all"
            >
              <h3 className="text-xl font-semibold mb-2">Register New Hotel</h3>
              <p className="text-sm opacity-90">
                Add new properties and expand your reach.
              </p>
            </a>

            <a
              href="/host/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-lg text-center transition-all"
            >
              <h3 className="text-xl font-semibold mb-2">Manage Hotels</h3>
              <p className="text-sm opacity-90">
                View rooms, edit details, add room inventory.
              </p>
            </a>

            <a
              href="/host/dashboard#bookings"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-xl shadow-lg text-center transition-all"
            >
              <h3 className="text-xl font-semibold mb-2">Bookings</h3>
              <p className="text-sm opacity-90">
                Track guest bookings and respond quickly.
              </p>
            </a>
          </div>
        </section>
      )}

     {/* ✅ Top Hotels Section */}
<section className="max-w-6xl mx-auto px-6 py-20 bg-[#0F172A] text-white rounded-2xl shadow-lg mt-10">
  <h2 className="text-3xl font-bold text-center mb-12 tracking-wide">
    Top Hotels
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
    {hotels.map((hotel) => (
      <HotelCard
        key={hotel.id}
        img={hotel.img}
        name={hotel.name}
        desc={hotel.desc}
      />
    ))}
  </div>
</section>

      {/* ✅ CTA Section for Guests */}
      {(!user || user.user_type === "guest") && (
        <section className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white py-20 text-center transition-all">
          <h2 className="text-4xl font-bold mb-4">Find Your Perfect Mid-Term Stay</h2>
          <p className="max-w-2xl mx-auto mb-8 text-lg opacity-90">
            Affordable, flexible accommodations for students, professionals,
            interns, and travelers.
          </p>
          <a
            href="/hotels"
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-gray-100"
          >
            Explore Hotels
          </a>
        </section>
      )}

      <Footer />

      {/* ✅ Chatbot Added */}
      <Chatbot />
    </main>
  );
}
