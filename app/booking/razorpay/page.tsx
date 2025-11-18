"use client";
import { useState } from "react";

export default function RazorpayPage() {
  const [amount, setAmount] = useState(500); // test amount ₹500

  const loadRazorpay = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    // Call Flask backend to create order
    const orderRes = await fetch("http://127.0.0.1:5000/create-razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await orderRes.json();

    const options = {
      key: data.key,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "StayFinder Hotel Booking",
      description: "Secure hotel booking payment",
      order_id: data.order.id,
      handler: async function (response: any) {
        const verifyRes = await fetch("http://127.0.0.1:5000/verify-razorpay-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          alert("✅ Payment Successful!");
          window.location.href = "/payment-success";
        } else {
          alert("❌ Payment Failed!");
          window.location.href = "/payment-cancel";
        }
      },
      theme: { color: "#4F46E5" },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-semibold mb-6">Book Your Stay</h1>
      <button
        onClick={handlePayment}
        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg text-lg font-medium"
      >
        Pay ₹{amount} with Google Pay / UPI
      </button>
    </div>
  );
}
