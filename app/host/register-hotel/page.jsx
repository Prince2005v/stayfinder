"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function RegisterHotelPage() {
  const router = useRouter();

  const [hotelName, setHotelName] = useState("");
  const [address, setAddress] = useState("");
  const [starRating, setStarRating] = useState("");
  const [phone, setPhone] = useState("");
  const [rooms, setRooms] = useState("");
  const [restaurantAvailable, setRestaurantAvailable] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("hotel_name", hotelName);
    formData.append("address", address);
    formData.append("star_rating", starRating);
    formData.append("phone_number", phone);
    formData.append("total_rooms_available", rooms);
    formData.append("restaurant_available", restaurantAvailable ? "true" : "false");
    if (documentFile) formData.append("valid_document", documentFile);

    const res = await fetch("http://127.0.0.1:5000/register-hotel", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Hotel Registered Successfully!");
      router.push("/host/hotels");
    } else {
      alert(data.error);
    }
  }

  return (
    <>
      <Navbar />

      <main className="pt-28 px-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-bold text-center mb-10">Register New Hotel</h1>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* ✅ LEFT: Preview Card */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>

            <div className="bg-gray-200 dark:bg-gray-700 h-40 rounded-lg mb-4"></div>

            <p className="font-bold text-lg">{hotelName || "Hotel Name"}</p>
            <p className="text-gray-600 dark:text-gray-400">{address || "Address"}</p>
            <p className="mt-2">⭐ {starRating || 0} – {rooms || 0} Rooms</p>
            {restaurantAvailable && (
              <p className="text-green-600 font-semibold mt-2">🍽 Restaurant Available</p>
            )}
          </div>

          {/* ✅ RIGHT: Form */}
          <form
            onSubmit={handleSubmit}
            className="md:col-span-2 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 space-y-5"
          >
            <h2 className="text-2xl font-semibold mb-4">Hotel Details</h2>

            <input
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              placeholder="Hotel Name"
              onChange={(e) => setHotelName(e.target.value)}
            />

            <input
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              placeholder="Address (City, State)"
              onChange={(e) => setAddress(e.target.value)}
            />

            <input
              type="number"
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              placeholder="Star Rating (1–5)"
              onChange={(e) => setStarRating(e.target.value)}
            />

            <input
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              placeholder="Hotel Phone Number"
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              type="number"
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              placeholder="Total Rooms Available"
              onChange={(e) => setRooms(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                onChange={(e) => setRestaurantAvailable(e.target.checked)}
              />
              <span>Restaurant Available</span>
            </div>

            <label className="block mt-4 font-medium">Upload Verification Document:</label>
            <input
              type="file"
              onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
            />

            <button
              type="submit"
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Register Hotel
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}



