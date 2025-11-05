import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HotelsPage() {
  const hotels = [
    {
      category: "Normal",
      items: [
        {
          name: "City Comfort Inn",
          image:
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
          description:
            "Affordable and cozy rooms located in the heart of the city. Perfect for solo travelers or short stays.",
          price: "₹15,000 / month",
        },
        {
          name: "Urban Stay",
          image:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60",
          description:
            "Simple, clean, and comfortable rooms with all basic amenities like WiFi, AC, and breakfast.",
          price: "₹18,500 / month",
        },
        {
          name: "Comfort Nest",
          image:
            "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?auto=format&fit=crop&w=800&q=60",
          description:
            "Peaceful environment with spacious rooms, complimentary breakfast, and easy access to transport.",
          price: "₹17,000 / month",
        },
      ],
    },
    {
      category: "Luxury",
      items: [
        {
          name: "The Grand Horizon",
          image:
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=60",
          description:
            "Spacious suites with elegant interiors, rooftop pool access, and in-room dining experience.",
          price: "₹48,000 / month",
        },
        {
          name: "Palm View Resort",
          image:
            "https://images.unsplash.com/photo-1590490359864-5c7b1d4cdbd1?auto=format&fit=crop&w=800&q=60",
          description:
            "Luxury resort offering sea-view balconies, spa facilities, and fine dining options.",
          price: "₹52,000 / month",
        },
        {
          name: "Ocean Pearl Retreat",
          image:
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
          description:
            "Luxurious experience with beachfront views, 24/7 butler service, and premium lounge access.",
          price: "₹56,000 / month",
        },
      ],
    },
    {
      category: "Premium",
      items: [
        {
          name: "Royal Orchid Suites",
          image:
            "https://images.unsplash.com/photo-1600585154154-8e1a9aefeb70?auto=format&fit=crop&w=800&q=60",
          description:
            "Experience top-tier comfort with private jacuzzis, butler service, and panoramic city views.",
          price: "₹85,000 / month",
        },
        {
          name: "Skyline Palace",
          image:
            "https://images.unsplash.com/photo-1600585154084-4e18e8ae00b6?auto=format&fit=crop&w=800&q=60",
          description:
            "Exclusive penthouse-style suites, infinity pool, fine dining, and world-class concierge.",
          price: "₹95,000 / month",
        },
        {
          name: "Crown Imperial",
          image:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60",
          description:
            "Ultra-luxurious stay with marble interiors, personal chef, and VIP transportation facilities.",
          price: "₹1,10,000 / month",
        },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white pt-28 px-6 pb-20">
        {/* Header Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-blue-700 dark:text-blue-400 mb-4">
            Our Hotels
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover your ideal stay — from affordable comfort to premium luxury.
            Whether you’re traveling for work, study, or leisure, we’ve got you covered.
          </p>
        </section>

        {/* Hotel Categories */}
        <div className="max-w-7xl mx-auto space-y-16">
          {hotels.map((section) => (
            <div key={section.category}>
              <h2 className="text-3xl font-bold mb-8 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 pl-4">
                {section.category} Hotels
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {section.items.map((hotel) => (
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
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                        {hotel.description}
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
