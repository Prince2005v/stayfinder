"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HotelsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [filtered, setFiltered] = useState<typeof hotels>([]);

  const hotels = [
    // 🌇 Normal Hotels
    {
      name: "City Comfort Inn",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=60",
      description:
        "Affordable and cozy rooms located in the heart of the city. Perfect for solo travelers or short stays.",
      location: "Delhi",
      lat: 28.6139,
      lon: 77.209,
      price: "₹15,000 / month",
    },
    {
      name: "Urban Stay",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=60",
      description:
        "Simple, clean, and comfortable rooms with WiFi, AC, and breakfast included.",
      location: "Jaipur",
      lat: 26.9124,
      lon: 75.7873,
      price: "₹18,000 / month",
    },
    {
      name: "Lakeview Lodge",
      image:
        "https://plus.unsplash.com/premium_photo-1686090448517-2f692cc45187?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bG9kZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500",
      description:
        "Peaceful stay near the lakeside with great views and nature vibes.",
      location: "Udaipur",
      lat: 24.5854,
      lon: 73.7125,
      price: "₹17,500 / month",
    },

    // 🏨 Luxury Hotels
    {
      name: "The Grand Horizon",
      image:
        "data:image/jpeg;base64,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",
      description:
        "Spacious suites with rooftop pool access and in-room dining experience.",
      location: "Mumbai",
      lat: 19.076,
      lon: 72.8777,
      price: "₹48,000 / month",
    },
    {
      name: "Palm View Resort",
      image:
        "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHJlc29ydHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
      description:
        "Luxury resort offering sea-view balconies, spa facilities, and fine dining.",
      location: "Goa",
      lat: 15.2993,
      lon: 74.124,
      price: "₹52,000 / month",
    },
    {
      name: "Blue Lagoon Retreat",
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVzb3J0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500",
      description:
        "Elegant interiors and ocean-facing rooms perfect for relaxation.",
      location: "Kerala",
      lat: 10.8505,
      lon: 76.2711,
      price: "₹55,000 / month",
    },

    // 👑 Premium Hotels
    {
      name: "Royal Orchid Suites",
      image:
        "https://plus.unsplash.com/premium_photo-1661879252375-7c1db1932572?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fGhvdGVsfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500",
      description:
        "Private jacuzzis, butler service, and panoramic city views included.",
      location: "Bangalore",
      lat: 12.9716,
      lon: 77.5946,
      price: "₹85,000 / month",
    },
    {
      name: "Taj Grandeur Hotel",
      image:
        "https://plus.unsplash.com/premium_photo-1661964402307-02267d1423f5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGhvdGVsfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500",
      description:
        "Penthouse suites with infinity pool and luxury dining options.",
      location: "Hyderabad",
      lat: 17.385,
      lon: 78.4867,
      price: "₹95,000 / month",
    },
    {
      name: "Elite Heights",
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=60",
      description:
        "Ultra-premium stay experience with skyline views and concierge service.",
      location: "Chennai",
      lat: 13.0827,
      lon: 80.2707,
      price: "₹92,000 / month",
    },
  ];

  useEffect(() => {
    setFiltered(hotels);
  }, []);

  // 🔍 Search Filter
  const handleSearch = (e: { target: { value: string; }; }) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFiltered(
      hotels.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(value) ||
          hotel.location.toLowerCase().includes(value)
      )
    );
  };

  // 📍 Get Live Location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocation({ lat, lon });
          const nearby = hotels.filter(
            (h) =>
              Math.abs(h.lat - lat) < 5 && Math.abs(h.lon - lon) < 5 // approx match
          );
          setFiltered(nearby.length ? nearby : hotels);
        },
        () => alert("Location permission denied.")
      );
    } else {
      alert("Geolocation not supported in this browser.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-linear-to-b from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white pt-28 px-6 pb-20">
        {/* 🔎 Search Section */}
        <section className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-4">
            Find Your Perfect Hotel
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Search by name or location — or let us find nearby hotels using your
            current location.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <input
              type="text"
              placeholder="Search hotels..."
              className="w-full sm:w-96 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={search}
              onChange={handleSearch}
            />
            <button
              onClick={handleGetLocation}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              📍 Use My Location
            </button>
          </div>

          {location && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Location detected: {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
            </p>
          )}
        </section>

        {/* 🏨 Hotel List */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.length > 0 ? (
            filtered.map((hotel) => (
              <div
                key={hotel.name}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {hotel.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    📍 {hotel.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {hotel.price}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 col-span-3">
              No hotels found for your search.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
