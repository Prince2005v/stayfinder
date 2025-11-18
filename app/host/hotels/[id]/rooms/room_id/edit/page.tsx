"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ViewRoomsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/hotels/${id}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setHotel(data.hotel));
  }, [id]);

  async function deleteRoom(roomId: string) {
    const token = localStorage.getItem("token");

    if (!confirm("Delete this room?")) return;

    const res = await fetch(`http://127.0.0.1:5000/hotels/${id}/rooms/${roomId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      alert("Room deleted");
      location.reload();
    } else {
      alert(data.error);
    }
  }

  if (!hotel) return <div className="pt-24 text-center">Loading...</div>;

  return (
    <>
      <Navbar />
      <main className="pt-24 px-6 min-h-screen">
        <h1 className="text-3xl font-bold">{hotel.hotel_name} — Rooms</h1>

        <button
          onClick={() => router.push(`/host/hotels/${id}/add-room`)}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Room
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {hotel.rooms?.map((room: any) => (
            <div key={room._id} className="bg-gray-100 p-4 rounded-xl shadow">
              <h3 className="font-semibold text-xl">{room.room_type}</h3>
              <p>{room.description}</p>
              <p className="text-sm">Occupancy: {room.occupancy}</p>

              <div className="flex gap-3 mt-3">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                  onClick={() =>
                    router.push(`/host/hotels/${id}/rooms/${room._id}/edit`)
                  }
                >
                  Edit
                </button>

                <button
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  onClick={() => deleteRoom(room._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
