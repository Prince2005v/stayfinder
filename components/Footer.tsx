export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-6 mt-12 text-center">
      <p className="text-sm">
        © {new Date().getFullYear()} StayFinder. Your trusted hotel booking partner.
      </p>
      
    </footer>
  );
}
