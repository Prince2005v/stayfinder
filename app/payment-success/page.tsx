"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-4xl font-bold text-green-800">
        ✅ Payment Successful!
      </h1>
      <p className="mt-3 text-gray-700">Your booking is confirmed.</p>

      <Link
        href="/"
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg"
      >
        Go Home
      </Link>
    </main>
  );
}
