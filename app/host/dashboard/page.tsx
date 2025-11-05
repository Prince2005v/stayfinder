"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
interface Hotel {
  _id: string;
  hotel_name: string;
  address: string;
  star_rating: string;
}

interface Booking {
  _id: string;
  hotel_id: string;
  room_id: string;
  user_id: string;
  checkin: string;
  checkout: string;
  status: string;
}

export default function HostDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadData() {
      try {
        const hotelRes = await fetch("http://127.0.0.1:5000/host/hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const bookingRes = await fetch("http://127.0.0.1:5000/host/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const hotelsData = await hotelRes.json();
        const bookingsData = await bookingRes.json();

        setHotels(hotelsData.hotels || []);
        setBookings(bookingsData.bookings || []);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading)
    return (
      <main className="pt-24 text-center text-xl">Loading dashboard...</main>
    );

  return (
    <>
    <Navbar />
    <main className="pt-24 px-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-10 text-center">Host Dashboard</h1>

      {/* ✅ Summary Cards */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
          <h3 className="text-3xl font-bold">{hotels.length}</h3>
          <p className="text-gray-500 mt-2">Registered Hotels</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
          <h3 className="text-3xl font-bold">{bookings.length}</h3>
          <p className="text-gray-500 mt-2">Total Bookings</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
          <h3 className="text-3xl font-bold">
            {
              bookings.filter((b) => b.status === "confirmed").length
            }
          </h3>
          <p className="text-gray-500 mt-2">Confirmed Stays</p>
        </div>
      </section>

      {/* ✅ Quick Actions */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/host/register-hotel"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-lg text-center"
          >
            ➕ Register New Hotel
          </Link>

          <a
            href="/host/hotels"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-lg text-center"
          >
            🏨 View Hotels
          </a>

          <Link
            href="/host/bookings"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-xl shadow-lg text-center"
          >
            📅 View Bookings
          </Link>
        </div>
      </section>

      {/* ✅ Hotel List */}
      <section id="hotels" className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl font-bold mb-6">Your Hotels</h2>

        {hotels.length === 0 ? (
          <p className="text-gray-600">No hotels registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel._id}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-semibold">{hotel.hotel_name}</h3>
                <p className="text-gray-600">{hotel.address}</p>
                <p className="text-gray-400 text-sm">
                  ⭐ {hotel.star_rating} Star Property
                </p>

                <div className="mt-4 flex gap-4">
                  <Link
                    href={`/host/hotels/${hotel._id}/rooms`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    View Rooms
                  </Link>

                  <Link
                    href={`/host/hotels/${hotel._id}/add-room`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Add Room
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ✅ Booking Section */}
      <section id="bookings" className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>

        {bookings.length === 0 ? (
          <p className="text-gray-600">No bookings received yet.</p>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="p-6 bg-white text-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-bold mb-2">
                  Booking #{booking._id}
                </h3>
                <p className="">Hotel ID: {booking.hotel_id}</p>
                <p className="">Room ID: {booking.room_id}</p>
                <p className="">User: {booking.user_id}</p>

                <div className="mt-3 ">
                  <p>
                    🗓 Check-in: <b>{booking.checkin}</b>
                  </p>
                  <p>
                    🕒 Check-out: <b>{booking.checkout}</b>
                  </p>
                  <p>
                    ✅ Status:{" "}
                    <span
                      className={`font-bold ${
                        booking.status === "confirmed"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </p>
                  
                </div>
                {booking.status === "pending" && (
    <button
      onClick={async () => {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://127.0.0.1:5000/host/booking/confirm/${booking._id}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (res.ok) {
          alert("✅ Booking Confirmed!");
          window.location.reload();
        } else {
          alert(data.error);
        }
      }}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
    >
      ✅ Confirm Booking
    </button>
  )}
              </div>
            ))}
          </div>
        )}
      </section>
    <Footer />
    </main>
    </>
  );
}
