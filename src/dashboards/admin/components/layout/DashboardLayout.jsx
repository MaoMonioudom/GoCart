import Header from "./Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-8">
        {children}
      </main>
    </div>
  );
}
