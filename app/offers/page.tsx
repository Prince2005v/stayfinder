import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OffersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pt-28 px-6">
        <h1 className="text-4xl font-bold text-center mb-4">Special Offers</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          Save more with long-stay discounts and exclusive deals tailored for every traveler.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Offer 1 */}
          <div className="p-6 rounded-2xl bg-blue-900 text-white shadow-md hover:scale-[1.02] transition">
            <h2 className="text-xl font-semibold mb-2">Stay 3 Months, Get 15% Off</h2>
            <p className="text-sm opacity-90 mb-3">
              Perfect for interns, digital nomads, and students looking for long-term stays.
            </p>
            <button className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
              Book Now
            </button>
          </div>

          {/* Offer 2 */}
          <div className="p-6 rounded-2xl bg-green-900 text-white shadow-md hover:scale-[1.02] transition">
            <h2 className="text-xl font-semibold mb-2">Weekend Discount</h2>
            <p className="text-sm opacity-90 mb-3">
              Book between Friday–Sunday and save <span className="font-semibold">10% instantly!</span>
            </p>
            <button className="bg-white text-green-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
              Claim Offer
            </button>
          </div>

          {/* Offer 3 */}
          <div className="p-6 rounded-2xl bg-indigo-800 text-white shadow-md hover:scale-[1.02] transition">
            <h2 className="text-xl font-semibold mb-2">Early Bird Saver</h2>
            <p className="text-sm opacity-90 mb-3">
              Book your stay at least 30 days in advance and enjoy <span className="font-semibold">20% off</span>.
            </p>
            <button className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
              Grab Deal
            </button>
          </div>

          {/* Offer 4 */}
          <div className="p-6 rounded-2xl bg-yellow-600 text-white shadow-md hover:scale-[1.02] transition">
            <h2 className="text-xl font-semibold mb-2">Group Stay Bonus</h2>
            <p className="text-sm opacity-90 mb-3">
              Get an extra <span className="font-semibold">10% off</span> when you book 3 or more rooms.
            </p>
            <button className="bg-white text-yellow-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
              Book Together
            </button>
          </div>

          {/* Offer 5 */}
          <div className="p-6 rounded-2xl bg-pink-700 text-white shadow-md hover:scale-[1.02] transition">
            <h2 className="text-xl font-semibold mb-2">Flash Deal</h2>
            <p className="text-sm opacity-90 mb-3">
              Limited time! Save <span className="font-semibold">25%</span> on bookings made within the next 24 hours.
            </p>
            <button className="bg-white text-pink-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
              Hurry Up
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
