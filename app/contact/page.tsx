export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pt-24 px-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-12">
        Have a question or need help? Reach out to our support team anytime.
      </p>

      <form className="max-w-xl mx-auto bg-gray-100 dark:bg-gray-800 p-8 rounded-xl shadow-md text-left space-y-4">
        <div>
          <label className="block mb-2">Your Name</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-white dark:bg-gray-700"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            className="w-full p-3 rounded-lg bg-white dark:bg-gray-700"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block mb-2">Message</label>
          <textarea
            className="w-full p-3 rounded-lg bg-white dark:bg-gray-700"
            placeholder="Type your message..."
          />
        </div>
        <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Send Message
        </button>
      </form>
    </main>
  );
}
