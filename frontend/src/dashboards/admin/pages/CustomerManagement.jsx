import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard";
import DataTable from "../components/table/DataTable";
import CustomerAreaChart from "../components/charts/CustomerAreaChart";
import CustomerDetailModal from "../components/modals/CustomerDetailModal";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNSwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzczNzQxOTY4fQ.nNOHYhysqZX_RpHlM2XEtFN4vpu17h05Cy9MF7Z-1ho";
export default function CustomerManagement() {

  const [stats, setStats] = useState([]);
  const [overviewData, setOverviewData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [overviewView, setOverviewView] = useState("this_week");

  const [currentPage, setCurrentPage] = useState(1);

  // show 10 customers per page
  const ITEMS_PER_PAGE = 10;

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [overviewView, currentPage]);

  const fetchData = async () => {

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // ======================
    // FETCH STATS
    // ======================

    const statsRes = await fetch(
      "http://localhost:5000/admin/customers/stats",
      { headers }
    );

    const statsData = await statsRes.json();

    setStats([
      {
        title: "Total Customers",
        value: statsData.totalCustomers,
        change: statsData.growth?.customers || 0,
      },
      {
        title: "New Customers",
        value: statsData.newCustomers,
        change: statsData.growth?.customers || 0,
      },
      {
        title: "Visitors",
        value: statsData.visitors,
        change: statsData.growth?.visitors || 0,
      },
    ]);

    // ======================
    // FETCH OVERVIEW
    // ======================

    const overviewRes = await fetch(
      `http://localhost:5000/admin/customers/overview?range=${overviewView}`,
      { headers }
    );

    setOverviewData(await overviewRes.json());

    // ======================
    // FETCH CUSTOMER TABLE
    // ======================

    const tableRes = await fetch(
      `http://localhost:5000/admin/customers?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
      { headers }
    );

    const tableData = await tableRes.json();

    setCustomers(
      tableData.data.map((c) => ({
        id: c.customerId,
        name: c.name,
        phone: c.phone,
        email: c.email,
        orders: c.orderCount,
        totalSpend: c.totalSpend,
        status: c.status,
      }))
    );

    setTotalPages(tableData.pagination.totalPages);
  };

  // ======================
  // SAVE CUSTOMER
  // ======================

  const handleSaveCustomer = async (updatedCustomer) => {

  const nameParts = updatedCustomer.name.split(" ");

    await fetch(`http://localhost:5000/admin/customer/${updatedCustomer.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(" "),
        phone_number: updatedCustomer.phone,
        email: updatedCustomer.email
      }),
    });

    fetchData();
    setSelectedCustomer(null);
};

  // ======================
  // DELETE CUSTOMER
  // ======================

  const handleDeleteCustomer = async (customerId) => {

    await fetch(`http://localhost:5000/admin/customer/${customerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchData();
    setSelectedCustomer(null);
  };

  // ======================
  // TABLE COLUMNS
  // ======================

  const customerColumns = [
    { label: "Customer ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Phone", key: "phone" },
    { label: "Email", key: "email" },
    { label: "Order Count", key: "orders" },
    {
      label: "Total Spend",
      key: "totalSpend",
      render: (row) => `$${row.totalSpend.toLocaleString()}`,
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`font-medium ${
            row.status === "Active"
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          ● {row.status}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (row) => (
        <button
          onClick={() => setSelectedCustomer(row)}
          className="px-4 py-1 text-sm border rounded-md hover:bg-gray-100"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>

      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Management
        </h1>

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {stats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              change={item.change}
            />
          ))}

        </div>

        {/* OVERVIEW */}

        <div className="bg-white rounded-xl border p-6">

          <div className="flex justify-between items-center mb-4">

            <h3 className="font-semibold text-gray-700">
              Customer Overview
            </h3>

            <div className="flex gap-2">

              <button
                onClick={() => setOverviewView("this_week")}
                className={`px-4 py-1 text-xs rounded-full border ${
                  overviewView === "this_week"
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                This week
              </button>

              <button
                onClick={() => setOverviewView("last_week")}
                className={`px-4 py-1 text-xs rounded-full border ${
                  overviewView === "last_week"
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                Last week
              </button>

            </div>

          </div>

          <CustomerAreaChart data={overviewData} />

        </div>

        {/* CUSTOMER TABLE */}

        <div className="bg-white rounded-xl border p-6">

          <h3 className="font-semibold text-center mb-4">
            Customer Table
          </h3>

          <DataTable columns={customerColumns} data={customers} />

          {/* PAGINATION */}

          <div className="flex justify-center gap-2 mt-6">

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}

          </div>

        </div>

        {/* CUSTOMER MODAL */}

        {selectedCustomer && (
          <CustomerDetailModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onSave={handleSaveCustomer}
            onDelete={handleDeleteCustomer}
          />
        )}

      </div>

    </DashboardLayout>
  );
}