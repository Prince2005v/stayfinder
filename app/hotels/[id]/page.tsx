"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState<any>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/hotels/${id}`)
      .then((r) => r.json())
      .then((data) => setHotel(data.hotel));
  }, [id]);

  if (!hotel) return <main className="pt-24">Loading...</main>;

  return (
    <main className="pt-24 px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-4">{hotel.hotel_name}</h1>
      <p className="text-gray-600">{hotel.address}</p>
      <p className="mt-2 text-yellow-500 text-lg">⭐ {hotel.star_rating} Star</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Available Rooms</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotel.rooms.map((room: any) => (
          <div
            key={room._id}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <h3 className="text-xl font-bold">{room.room_type}</h3>
            <p className="text-gray-600">{room.description}</p>

            <p className="mt-3 font-semibold">Pricing:</p>
            <div className="mt-3">
              <p className="font-semibold">Pricing (Long Stay):</p>
              <ul className="text-white-700 text-sm">
                <li>15 days: ₹{room.pricing?.price_15 ?? "—"}</li>
                <li>30 days: ₹{room.pricing?.price_30 ?? "—"}</li>
                <li>45 days: ₹{room.pricing?.price_45 ?? "—"}</li>
                <li>60 days: ₹{room.pricing?.price_60 ?? "—"}</li>
                <li>75 days: ₹{room.pricing?.price_75 ?? "—"}</li>
                <li>90 days: ₹{room.pricing?.price_90 ?? "—"}</li>
              </ul>
            </div>

            <Link
              href={`/booking?hotel=${hotel._id}&room=${room._id}`}
              className="block mt-4 w-full bg-blue-600 text-white text-center py-2 rounded-lg"
            >
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
