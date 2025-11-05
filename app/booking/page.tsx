"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function BookingPage() {
  const params = useSearchParams();
  const router = useRouter();

  const hotel_id = params.get("hotel");
  const room_id = params.get("room");

  const [duration, setDuration] = useState("30");
  const [checkin, setCheckin] = useState("");

  async function handleBooking() {
    if (!checkin) {
      alert("Please select a check-in date.");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:5000/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hotel_id,
        room_id,
        duration: Number(duration),  // ✅ ensure number
        checkin,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Booking created!");
      router.push(`/user/dashboard`);
    } else {
      alert(data.error);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 px-6 min-h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-6">Complete Your Booking</h1>

        <div className="max-w-xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">

          <label className="block mb-2 font-semibold">Check-in Date</label>
          <input
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            className="w-full p-3 rounded-lg border mb-4"
          />

          <label className="block mb-2 font-semibold">Select Stay Duration</label>
          <select
            className="w-full p-3 rounded-lg"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="15">15 days</option>
            <option value="30">30 days</option>
            <option value="45">45 days</option>
            <option value="60">60 days</option>
            <option value="75">75 days</option>
            <option value="90">90 days</option>
          </select>

          <button
            onClick={handleBooking}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Proceed to Pay
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
