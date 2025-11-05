"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AddRoomPage() {
  const { id } = useParams(); // hotel ID
  const router = useRouter();

  const [roomType, setRoomType] = useState("");
  const [description, setDescription] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [amenities, setAmenities] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [price15, setPrice15] = useState("");
  const [price30, setPrice30] = useState("");
  const [price45, setPrice45] = useState("");
  const [price60, setPrice60] = useState("");
  const [price75, setPrice75] = useState("");
  const [price90, setPrice90] = useState("");

  async function submitRoom() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    const formData = new FormData();
    formData.append("room_type", roomType);
    formData.append("description", description);
    formData.append("occupancy", occupancy);
    formData.append("amenities", amenities);

    formData.append("price_15", price15);
    formData.append("price_30", price30);
    formData.append("price_45", price45);
    formData.append("price_60", price60);
    formData.append("price_75", price75);
    formData.append("price_90", price90);

    if (image) formData.append("image", image);

    const res = await fetch(`http://127.0.0.1:5000/hotels/${id}/add-room`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Room added successfully!");
      router.push(`/host/hotels/${id}/rooms`);
    } else {
      alert(data.error);
    }
  }

  return (
    <main className="pt-24 px-6 min-h-screen bg-white dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Add a New Room to Your Hotel
      </h1>

      <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
        Provide details about this room and set flexible pricing for mid-term
        stays (15–90 days). StayFinder uses this data to match long-stay guests
        with your property.
      </p>

      <div className="max-w-3xl mx-auto bg-gray-100 dark:bg-gray-800 p-10 rounded-xl shadow-xl">
        <div className="space-y-8">

          {/* Basic Room Info */}
          <div>
            <label className="block mb-1 font-medium">Room Type</label>
            <input
              className="w-full p-3 rounded-lg"
              placeholder="Deluxe Room, Premium Suite, Executive Room"
              onChange={(e) => setRoomType(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Occupancy</label>
            <input
              className="w-full p-3 rounded-lg"
              placeholder="e.g., 2 Adults | 1 Child"
              onChange={(e) => setOccupancy(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Room Description</label>
            <textarea
              className="w-full p-3 rounded-lg"
              placeholder="Describe room features, comfort, and suitability for long stays."
              rows={4}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Pricing Section */}
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold mb-4">Mid-Term Stay Prices</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="number"
                className="p-3 rounded-lg"
                placeholder="15-Day Price (₹)"
                onChange={(e) => setPrice15(e.target.value)}
              />
              <input
                type="number"
                className="p-3 rounded-lg"
                placeholder="30-Day Price (₹)"
                onChange={(e) => setPrice30(e.target.value)}
              />
              <input
                type="number"
                className="p-3 rounded-lg"
                placeholder="45-Day Price (₹)"
                onChange={(e) => setPrice45(e.target.value)}
              />
              <input
                type="number"
                className="p-3 rounded-lg"
                placeholder="60-Day Price (₹)"
                onChange={(e) => setPrice60(e.target.value)}
              />
              <input
                type="number"
                className="p-3 rounded-lg"
                placeholder="75-Day Price (₹)"
                onChange={(e) => setPrice75(e.target.value)}
              />
              <input
                type="number"
                className="p-3 rounded-lg"
                placeholder="90-Day Price (₹)"
                onChange={(e) => setPrice90(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Amenities</label>
            <input
              className="w-full p-3 rounded-lg"
              placeholder="WiFi, AC, Kitchenette, Workspace, Laundry (comma-separated)"
              onChange={(e) => setAmenities(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Room Image</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <button
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            onClick={submitRoom}
          >
            Add Room
          </button>
        </div>
      </div>
    </main>
  );
}
