import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const DoctorSchedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [schedule, setSchedule] = useState({
    regularSchedule: {
      monday: { startTime: "09:00", endTime: "17:00", isAvailable: true },
      tuesday: { startTime: "09:00", endTime: "17:00", isAvailable: true },
      wednesday: { startTime: "09:00", endTime: "17:00", isAvailable: true },
      thursday: { startTime: "09:00", endTime: "17:00", isAvailable: true },
      friday: { startTime: "09:00", endTime: "17:00", isAvailable: true },
      saturday: { startTime: "09:00", endTime: "13:00", isAvailable: true },
      sunday: { startTime: "09:00", endTime: "13:00", isAvailable: true },
    },
    exceptions: [],
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5001/api/doctors/schedule",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setSchedule(response.data);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegularScheduleChange = (day, field, value) => {
    setSchedule({
      ...schedule,
      regularSchedule: {
        ...schedule.regularSchedule,
        [day]: {
          ...schedule.regularSchedule[day],
          [field]: field === "isAvailable" ? value === "true" : value,
        },
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5001/api/doctors/schedule", schedule, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule:", error);
      setError("Failed to update schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Schedule</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Regular Schedule */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Regular Schedule</h2>

          <div className="space-y-4">
            {Object.entries(schedule.regularSchedule).map(([day, schedule]) => (
              <div
                key={day}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                  <select
                    value={schedule.isAvailable.toString()}
                    onChange={(e) =>
                      handleRegularScheduleChange(
                        day,
                        "isAvailable",
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      handleRegularScheduleChange(
                        day,
                        "startTime",
                        e.target.value
                      )
                    }
                    disabled={!schedule.isAvailable}
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                      !schedule.isAvailable ? "bg-gray-50" : ""
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      handleRegularScheduleChange(
                        day,
                        "endTime",
                        e.target.value
                      )
                    }
                    disabled={!schedule.isAvailable}
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                      !schedule.isAvailable ? "bg-gray-50" : ""
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Exceptions */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Schedule Exceptions</h2>
            <button
              type="button"
              onClick={() => {
                setSchedule({
                  ...schedule,
                  exceptions: [
                    ...schedule.exceptions,
                    {
                      date: "",
                      startTime: "09:00",
                      endTime: "17:00",
                      isAvailable: true,
                      reason: "",
                    },
                  ],
                });
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
            >
              Add Exception
            </button>
          </div>

          <div className="space-y-4">
            {schedule.exceptions.map((exception, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-md"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={exception.date}
                    onChange={(e) => {
                      const updatedExceptions = [...schedule.exceptions];
                      updatedExceptions[index] = {
                        ...exception,
                        date: e.target.value,
                      };
                      setSchedule({
                        ...schedule,
                        exceptions: updatedExceptions,
                      });
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={exception.startTime}
                    onChange={(e) => {
                      const updatedExceptions = [...schedule.exceptions];
                      updatedExceptions[index] = {
                        ...exception,
                        startTime: e.target.value,
                      };
                      setSchedule({
                        ...schedule,
                        exceptions: updatedExceptions,
                      });
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={exception.endTime}
                    onChange={(e) => {
                      const updatedExceptions = [...schedule.exceptions];
                      updatedExceptions[index] = {
                        ...exception,
                        endTime: e.target.value,
                      };
                      setSchedule({
                        ...schedule,
                        exceptions: updatedExceptions,
                      });
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Available
                  </label>
                  <select
                    value={exception.isAvailable.toString()}
                    onChange={(e) => {
                      const updatedExceptions = [...schedule.exceptions];
                      updatedExceptions[index] = {
                        ...exception,
                        isAvailable: e.target.value === "true",
                      };
                      setSchedule({
                        ...schedule,
                        exceptions: updatedExceptions,
                      });
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={exception.reason}
                      onChange={(e) => {
                        const updatedExceptions = [...schedule.exceptions];
                        updatedExceptions[index] = {
                          ...exception,
                          reason: e.target.value,
                        };
                        setSchedule({
                          ...schedule,
                          exceptions: updatedExceptions,
                        });
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="Optional"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updatedExceptions = schedule.exceptions.filter(
                        (_, i) => i !== index
                      );
                      setSchedule({
                        ...schedule,
                        exceptions: updatedExceptions,
                      });
                    }}
                    className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {schedule.exceptions.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No schedule exceptions
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule;
