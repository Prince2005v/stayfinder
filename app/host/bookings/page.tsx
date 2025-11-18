"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HostBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/host/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />

      <main className="pt-24 px-6 min-h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8">Booking Requests</h1>

        {/* ✅ Skeleton Loader */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/4 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="text-center mt-16">
            {/* <img
              src="/empty.png"
              alt="No bookings"
              className="mx-auto w-48 opacity-80"
            /> */}
            <h2 className="text-xl font-semibold mt-4 text-gray-700 dark:text-gray-300">
              No Bookings Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Your hotel hasn’t received any booking requests yet.
            </p>
          </div>
        )}

        {/* ✅ Booking Cards */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((b: any) => (
              <div
                key={b._id}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-2">
                  Booking #{b._id}
                </h2>

                <p><b>Guest ID:</b> {b.user_id}</p>
                <p><b>Hotel:</b> {b.hotel_id}</p>
                <p><b>Room:</b> {b.room_id}</p>

                <div className="mt-2">
                  <p><b>Check-in:</b> {b.checkin}</p>
                  <p><b>Check-out:</b> {b.checkout}</p>
                </div>

                <p className="mt-3">
                  <b>Status:</b>{" "}
                  <span
                    className={
                      b.status === "confirmed"
                        ? "text-green-500 font-semibold"
                        : "text-yellow-600 font-semibold"
                    }
                  >
                    {b.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
