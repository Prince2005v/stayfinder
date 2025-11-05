"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("guest");
  const [otp, setOtp] = useState("");

  // Step 3
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // HOST EXTRA STEPS
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [starRating, setStarRating] = useState("");
  const [rooms, setRooms] = useState("");
  const [restaurantAvailable, setRestaurantAvailable] = useState("no");

  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // ───────────────────────────────────────
  // ✅ STEP 1 — START REGISTRATION
  // ───────────────────────────────────────
  async function handleStartRegistration(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/register/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, user_type: userType }),
    });

    const data = await res.json();

    if (res.ok) setStep(2);
    else alert(data.error);
  }

  // ───────────────────────────────────────
  // ✅ STEP 2 — VERIFY OTP
  // ───────────────────────────────────────
  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok) setStep(3);
    else alert(data.error);
  }

  // ───────────────────────────────────────
  // ✅ STEP 3 — COMPLETE PERSONAL DETAILS
  // ───────────────────────────────────────
  async function handleCompleteUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/register/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        phone_number: phone,
        city,
        state,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    // ✅ Save token
    localStorage.setItem("token", data.access_token);

    // ✅ If user is HOST → go to extra hotel steps
    if (userType === "host") {
      setStep(4);
      return;
    }

    // ✅ Guest → finish
    alert("Registration complete!");
    router.push("/");
  }

  // ───────────────────────────────────────
  // ✅ STEP 4 — HOST: BASIC HOTEL INFO
  // ───────────────────────────────────────
  function handleHostStep1(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep(5);
  }

  // ───────────────────────────────────────
  // ✅ STEP 5 — HOST: DOCUMENT UPLOAD & SUBMIT
  // ───────────────────────────────────────
  async function handleHostFinal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!documentFile) {
      alert("Please upload verification document");
      return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("hotel_name", hotelName);
    formData.append("address", hotelAddress);
    formData.append("star_rating", starRating);
    formData.append("phone_number", phone);
    formData.append("total_rooms_available", rooms);
    formData.append("restaurant_available", restaurantAvailable);
    formData.append("valid_document", documentFile);

    const res = await fetch("http://127.0.0.1:5000/register-hotel", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Hotel Registered Successfully!");
      router.push("/");
    } else {
      alert(data.error);
    }
  }

  // ───────────────────────────────────────
  // ✅ UI RENDERING
  // ───────────────────────────────────────
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-24 px-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Create Your Account</h1>

      <div className="max-w-xl mx-auto bg-gray-100 dark:bg-gray-800 p-8 rounded-xl shadow-md text-left">

        {/* ✅ STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleStartRegistration} className="space-y-4">
            <label>Email</label>
            <input type="email" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setEmail(e.target.value)} required />

            <label>Password</label>
            <input type="password" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setPassword(e.target.value)} required />

            <label>Register As</label>
            <select className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setUserType(e.target.value)}>
              <option value="guest">Guest</option>
              <option value="host">Host</option>
            </select>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
              Send OTP
            </button>
          </form>
        )}

        {/* ✅ STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <label>Enter OTP</label>
            <input type="text" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setOtp(e.target.value)} required />

            <button className="w-full bg-green-600 text-white py-3 rounded-lg">
              Verify OTP
            </button>
          </form>
        )}

        {/* ✅ STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleCompleteUser} className="space-y-4">
            <label>Full Name</label>
            <input type="text" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setName(e.target.value)} required />

            <label>Phone</label>
            <input type="text" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setPhone(e.target.value)} required />

            <label>City</label>
            <input type="text" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setCity(e.target.value)} required />

            <label>State</label>
            <input type="text" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setState(e.target.value)} required />

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
              Continue
            </button>
          </form>
        )}

        {/* ✅ STEP 4 — Host Only */}
        {step === 4 && userType === "host" && (
          <form onSubmit={handleHostStep1} className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Hotel Information</h2>

            <label>Hotel Name</label>
            <input type="text" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setHotelName(e.target.value)} required />

            <label>Hotel Address</label>
            <textarea className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setHotelAddress(e.target.value)} required />

            <label>Star Rating</label>
            <select className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setStarRating(e.target.value)} required>
              <option value="">Choose...</option>
              <option value="1">⭐</option>
              <option value="2">⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
              <option value="4">⭐⭐⭐⭐</option>
              <option value="5">⭐⭐⭐⭐⭐</option>
            </select>

            <label>Total Rooms</label>
            <input type="number" className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setRooms(e.target.value)} required />

            <label>Restaurant Available?</label>
            <select className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setRestaurantAvailable(e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>

            <button className="w-full bg-green-600 text-white py-3 rounded-lg">
              Continue
            </button>
          </form>
        )}

        {/* ✅ STEP 5 — Host document upload */}
        {step === 5 && userType === "host" && (
          <form onSubmit={handleHostFinal} className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Verification Document</h2>

            <label>Upload Document</label>
            <input type="file" accept="image/*,application/pdf"
              className="w-full p-3 bg-white dark:bg-gray-700"
              onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              required />

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
              Submit Hotel
            </button>
          </form>
        )}

        {/* ✅ Already Registered */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">Already registered?</p>
          <Link
            href="/signin"
            className="inline-block mt-1 bg-blue-600 text-white px-3 py-1 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
