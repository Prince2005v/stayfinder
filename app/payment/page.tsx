"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, useRouter } from "next/navigation";


export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();

  const booking_id = params.get("booking");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function createPaymentIntent() {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id }),
      });

      const data = await res.json();

      if (res.ok) {
        setClientSecret(data.clientSecret);
      } else {
        alert(data.error);
      }

      setLoading(false);
    }

    if (booking_id) {
      createPaymentIntent();
    }
  }, [booking_id]);

  async function handlePayment() {
    const stripe = await stripePromise;

    const { error } = await stripe!.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          token: "tok_visa", // ✅ Test mode shortcut — replace with real card element in production
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/payment/success");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Payment...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 px-6 min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-4">Complete Payment</h1>

          <p className="mb-4 text-gray-600 dark:text-gray-300">
            You will be redirected after successful payment.
          </p>

          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Pay Now
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
