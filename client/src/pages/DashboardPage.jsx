import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-10">Welcome to Event Management System</h1>

      {/* User Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-5">User Portal</h2>
        <div className="flex gap-5">
          <Link to="/user-login">
            <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
              User Login
            </button>
          </Link>
          <Link to="/user-register">
            <button className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">
              User Sign Up
            </button>
          </Link>
        </div>
      </div>

      {/* Admin Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-5">Admin Portal</h2>
        <div className="flex gap-5">
          <Link to="/admin-login">
            <button className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700">
              Admin Login
            </button>
          </Link>
          <Link to="/admin-register">
            <button className="bg-yellow-600 text-white px-5 py-2 rounded hover:bg-yellow-700">
              Admin Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
