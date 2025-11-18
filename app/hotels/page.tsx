"use client";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function HotelsPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function searchHotels() {
    if (!keyword.trim()) return;
    const res = await fetch(`http://127.0.0.1:5000/hotels/search?keyword=${keyword}`);
    const data = await res.json();
    setResults(data.hotels || []);
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 px-6 min-h-screen bg-[#0F172A] dark:bg-[#0F172A]">
        <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-lg">
          Find Your Perfect Stay 🏨
        </h1>

        {/* 🔍 Search Bar */}
        <div className="max-w-3xl mx-auto flex gap-3 mb-12 bg-white/10 backdrop-blur-md p-3 rounded-xl shadow-lg">
          <input
            className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Search by hotel name, city, or state..."
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            onClick={searchHotels}
            className="px-6 py-2 bg-white text-[#114357] font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300"
          >
            Search
          </button>
        </div>

        {/* 🏨 Hotel Results */}
        {results.length > 0 ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((hotel) => (
              <Link
                href={`/hotels/${hotel._id}`}
                key={hotel._id}
                className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-xl hover:scale-[1.03] transition-transform duration-300"
              >
                <img loading="lazy"
    src={hotel?.document_file_id
      ? `http://127.0.0.1:5000/file/${hotel.document_file_id}`
      : "/default-hotel.jpg"
    }
    alt={hotel.hotel_name}
    className="w-[314px] h-[209px] object-cover"
  />
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                  {hotel.hotel_name}
                </h2>
                <p className="text-gray-200 mt-1">Address : {hotel.address}</p>
                <p className="mt-2 text-yellow-300 font-semibold">⭐ {hotel.star_rating}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center mt-12 text-gray-200 italic">
            Search for hotels to see results
          </p>
        )}
      </main>

      <Footer />
    </>
  );
}
