import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUser,
  FaUserMd,
  FaUserInjured,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserShield,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers(currentPage, selectedRole);
  }, [currentPage, selectedRole]);

  const fetchUsers = async (page = 1, role = "all") => {
    try {
      setLoading(true);

      // Get token from context or localStorage
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        console.error("No authentication token available");
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(role !== "all" && { role }),
      }).toString();

      console.log(
        `Making request to: http://localhost:5001/api/admin/users?${queryParams}`
      );

      const response = await axios.get(
        `http://localhost:5001/api/admin/users?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      console.log("API Response:", response.data);

      if (response.data) {
        // Check if response has expected structure
        if (response.data.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          setTotalPages(response.data.pagination?.pages || 1);
          console.log(
            `Loaded ${response.data.users.length} users, total pages: ${
              response.data.pagination?.pages || 1
            }`
          );
        } else if (Array.isArray(response.data)) {
          // Direct array response
          setUsers(response.data);
          setTotalPages(1);
          console.log(`Loaded ${response.data.length} users (direct array)`);
        } else {
          console.error("Invalid response format:", response.data);
          setUsers([]);
          setTotalPages(1);
        }
      } else {
        setUsers([]);
        setTotalPages(1);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      await axios.put(
        `http://localhost:5001/api/admin/users/${userId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      // Update the user in the local state
      setUsers(
        users.map((user) =>
          user._id === userId
            ? { ...user, isActive: status === "active" }
            : user
        )
      );

      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, isActive: status === "active" });
      }

      toast.success(
        `User ${status === "active" ? "activated" : "suspended"} successfully`
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      toast.error(err.response?.data?.message || `Failed to ${status} user`);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      await axios.delete(
        `http://localhost:5001/api/admin/users/${selectedUser._id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setUsers(users.filter((user) => user._id !== selectedUser._id));
      setSelectedUser(null);
      setShowDeleteModal(false);
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaUserShield className="text-purple-500" />;
      case "doctor":
        return <FaUserMd className="text-green-500" />;
      case "patient":
        return <FaUserInjured className="text-blue-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Filter and search controls */}
      <div className="flex flex-wrap items-center mb-6 gap-4">
        <div>
          <label htmlFor="role-filter" className="mr-2 font-medium">
            Filter by Role:
          </label>
          <select
            id="role-filter"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-md px-3 py-1.5"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <button
          onClick={() => fetchUsers(currentPage, selectedRole)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* User list table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user._id}
                className={
                  selectedUser && selectedUser._id === user._id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }
                onClick={() => setSelectedUser(user)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <FaUser className="text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="mr-2">{getRoleIcon(user.role)}</div>
                    <div className="text-sm text-gray-900 capitalize">
                      {user.role}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.isActive ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateUserStatus(user._id, "inactive");
                      }}
                      className="text-red-600 hover:text-red-900 mr-4"
                    >
                      <FaLock className="inline mr-1" /> Suspend
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateUserStatus(user._id, "active");
                      }}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      <FaUnlock className="inline mr-1" /> Activate
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash className="inline mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-500 hover:bg-blue-50"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border-t border-b ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 hover:bg-blue-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-500 hover:bg-blue-50"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete user{" "}
              <span className="font-medium">{selectedUser?.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
