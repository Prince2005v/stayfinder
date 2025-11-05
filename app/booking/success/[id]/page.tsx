export default function BookingSuccessPage({ params }: any) {
  return (
    <main className="pt-24 px-6 text-center">
      <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
      <p className="mt-4 text-lg">Your booking ID: {params.id}</p>
    </main>
  );
}
