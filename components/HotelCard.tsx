interface HotelCardProps {
  img: string;
  name: string;
  desc: string;
}

export default function HotelCard({ img, name, desc }: HotelCardProps) {
  return (
    <div className="rounded-2xl shadow-md bg-gray-100 dark:bg-gray-800 overflow-hidden hover:scale-105 transition-transform">
      <img src={img} alt={name} className="w-full h-56 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-sm opacity-80 mb-4">{desc}</p>
        <button className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E40AF]  text-white rounded-lg ">
          Book Now
        </button>
      </div>
    </div>
  );
}
