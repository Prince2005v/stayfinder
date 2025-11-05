import Link from "next/link";
export default function HeroSection() {
  return (
    <section
      className="relative h-[90vh] w-full flex flex-col items-center justify-center text-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/hero.jpg')", // apna image name hero.jpg rakho (public folder me)
      }}
    >
      {/* Overlay for dark effect */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 text-white px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          Discover Your Perfect Hotel Stay
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl mb-6 opacity-90">
          Book premium hotels for weeks or months — affordable, verified, and convenient.
        </p>
        <Link href="/explore-hotel">
        <button className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
          Explore Hotels
        </button></Link>
      </div>
    </section>
  );
}
