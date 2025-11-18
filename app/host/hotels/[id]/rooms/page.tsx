"use client";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function ViewRoomsPage() {
  const { id } = useParams(); // hotel id
  const router = useRouter();
  const [hotel, setHotel] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`http://127.0.0.1:5000/hotels/${id}`);
      const data = await res.json();
      setHotel(data.hotel);
    }

    load();
  }, [id]);

  if (!hotel) return <main className="pt-24 text-center">Loading...</main>;

  return (

    <><Navbar/>
    <main className="pt-24 px-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6">{hotel.hotel_name} — Rooms</h1>

      <Link
        href={`/host/hotels/${id}/add-room`}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        ➕ Add New Room
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8 gap-6">
        {hotel.rooms?.map((room: any) => (
          <div
            key={room._id}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-bold">{room.room_type}</h2>

            <p className="text-gray-500">{room.description}</p>
            <p className="mt-2 text-gray-600">
              Occupancy: <b>{room.occupancy}</b>
            </p>

            <div className="mt-3">
              <p className="font-semibold">Pricing (Long Stay):</p>
              <ul className="text-gray-700 text-sm">
                <li>15 days: ₹{room.pricing?.price_15 ?? "—"}</li>
                <li>30 days: ₹{room.pricing?.price_30 ?? "—"}</li>
                <li>45 days: ₹{room.pricing?.price_45 ?? "—"}</li>
                <li>60 days: ₹{room.pricing?.price_60 ?? "—"}</li>
                <li>75 days: ₹{room.pricing?.price_75 ?? "—"}</li>
                <li>90 days: ₹{room.pricing?.price_90 ?? "—"}</li>
              </ul>
            </div>

            <p className="mt-3 text-sm text-gray-400">
              Amenities: {room.amenities.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </main><Footer/></>
  );
}
