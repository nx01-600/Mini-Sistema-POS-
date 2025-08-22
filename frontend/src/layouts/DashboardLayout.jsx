function DashboardLayout() {
  return (
    <div className="h-screen flex">
      <aside className="w-64 bg-blue-900 text-white p-4">
        Sidebar
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </main>
    </div>
  )
}

export default DashboardLayout
