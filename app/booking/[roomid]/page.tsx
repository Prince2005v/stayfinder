"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function BookingPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const hotelId = searchParams.get("hotel");
  const price = parseInt(searchParams.get("price") || "0");

  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");

  const total = price; // Expand later with number of nights

  async function confirmBooking() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:5000/book-room", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        price,
        checkin,
        checkout,
      }),
    });

    const data = await res.json();
    if (res.ok) router.push(`/booking/success/${data.booking_id}`);
  }

  return (
    <main className="pt-24 px-6">
      <h1 className="text-3xl font-bold">Complete Your Booking</h1>

      <div className="mt-8 space-y-4 max-w-lg">
        <input type="date" className="p-3 w-full bg-gray-100 dark:bg-gray-800"
          onChange={(e) => setCheckin(e.target.value)} />

        <input type="date" className="p-3 w-full bg-gray-100 dark:bg-gray-800"
          onChange={(e) => setCheckout(e.target.value)} />

        <p className="text-xl font-semibold">Total: ₹{total}</p>

        <button
          onClick={confirmBooking}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg"
        >
          Confirm Booking
        </button>
      </div>
    </main>
  );
}
