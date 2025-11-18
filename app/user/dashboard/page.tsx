"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/user/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []));
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-24 px-6 min-h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {bookings.length === 0 && (
          <p className="text-gray-500 text-lg">No bookings yet.</p>
        )}

        <div className="space-y-6 max-w-3xl mx-auto">
          {bookings.map((b: any) => (
            <div
              key={b._id}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-semibold">
                Booking #{b._id.slice(-6)}
              </h2>

              <p className="mt-2 text-gray-700 dark:text-gray-300">
                <b>Hotel:</b> {b.hotel_name}
              </p>

              <p>
                <b>Room:</b> {b.room_type}
              </p>

              <p>
                <b>Duration:</b> {b.duration} days
              </p>

              <p>
                <b>Check-in:</b> {new Date(b.checkin).toDateString()}
              </p>

              <p>
                <b>Check-out:</b> {new Date(b.checkout).toDateString()}
              </p>

              <p className="mt-2">
                <b>Status:</b>{" "}
                <span
                  className={
                    b.status === "confirmed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {b.status}
                </span>
              </p>

              <p className="mt-2 text-lg font-semibold">
                Price: ₹{b.price}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
