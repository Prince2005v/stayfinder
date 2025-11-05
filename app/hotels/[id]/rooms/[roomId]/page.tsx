"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Room {
  room_type: string;
  description: string;
  price: number;
}

export default function RoomDetailsPage() {
  const { id, roomId } = useParams();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/hotels/${id}/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => setRoom(data.room));
  }, []);

  if (!room) return <div className="pt-24 text-center">Loading...</div>;

  return (
    <main className="pt-24 px-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold">{room.room_type}</h1>
      <p className="text-lg mt-2">{room.description}</p>

      <p className="mt-4">
        <strong>Price:</strong> ₹{room.price}/night
      </p>

      <button
        onClick={() =>
          router.push(`/booking/${roomId}?hotel=${id}&price=${room.price}`)
        }
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg"
      >
        Book Now
      </button>
    </main>
  );
}
