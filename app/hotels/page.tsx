"use client";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function HotelsPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  async function searchHotels() {
    const res = await fetch(
      `http://127.0.0.1:5000/hotels/search?keyword=${keyword}`
    );
    const data = await res.json();
    setResults(data.hotels || []);
  }

  return (
    <><Navbar/>
    <main className="pt-24 px-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Find Your Stay</h1>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto flex gap-3 mb-10">
        <input
          className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
          placeholder="Search by hotel name, city, state..."
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          onClick={searchHotels}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((hotel: any) => (
          <Link
            href={`/hotels/${hotel._id}`}
            key={hotel._id}
            className="bg-gray-100 dark:bg-gray-800 p-5 rounded-xl shadow hover:scale-[1.02] transition"
          >
            <h2 className="text-xl font-bold">{hotel.hotel_name}</h2>
            <p className="text-gray-500 mt-1">{hotel.address}</p>
            <p className="mt-2">⭐ {hotel.star_rating}</p>
          </Link>
        ))}
      </div>
    </main><Footer/></>
  );
}
