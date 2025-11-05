export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="p-8 bg-white shadow rounded-lg text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          ✅ Payment Successful!
        </h1>
        <p>Your booking has been confirmed.</p>
      </div>
    </div>
  );
}
