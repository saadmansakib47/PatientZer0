import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const DoctorProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctorData, setDoctorData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    hospitalName: "",
    chamberAddress: "",
    consultationFee: "",
    bio: "",
    services: [],
    availableTimeSlots: [],
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5001/api/doctors/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDoctorData(response.data);
      setFormData({
        hospitalName: response.data.hospitalName || "",
        chamberAddress: response.data.chamberAddress || "",
        consultationFee: response.data.consultationFee || "",
        bio: response.data.bio || "",
        services: response.data.services || [],
        availableTimeSlots: response.data.availableTimeSlots || [],
        emergencyContact: response.data.emergencyContact || {
          name: "",
          phone: "",
          relationship: "",
        },
      });
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      setError("Failed to load doctor profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleTimeSlotChange = (index, field, value) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];

    if (field === "isAvailable") {
      updatedTimeSlots[index] = {
        ...updatedTimeSlots[index],
        [field]: value === "true",
      };
    } else {
      updatedTimeSlots[index] = {
        ...updatedTimeSlots[index],
        [field]: value,
      };
    }

    setFormData({
      ...formData,
      availableTimeSlots: updatedTimeSlots,
    });
  };

  const handleServicesChange = (e) => {
    const { value, checked } = e.target;
    let updatedServices = [...formData.services];

    if (checked) {
      updatedServices.push(value);
    } else {
      updatedServices = updatedServices.filter((service) => service !== value);
    }

    setFormData({
      ...formData,
      services: updatedServices,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5001/api/doctors/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Profile updated successfully!");
      setDoctorData(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error.response?.data?.error ||
          "Failed to update profile. Please try again."
      );
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

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No profile data found. Please complete your registration first.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctor Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={doctorData.name}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={doctorData.email}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                BMDC Number
              </label>
              <input
                type="text"
                value={doctorData.bmdcNumber}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <input
                type="text"
                value={doctorData.specialization}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Professional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hospital/Clinic Name
              </label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consultation Fee (BDT)
              </label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Chamber Address
              </label>
              <textarea
                name="chamberAddress"
                value={formData.chamberAddress}
                onChange={handleChange}
                disabled={!isEditing}
                rows="2"
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Available Time Slots</h2>

          {formData.availableTimeSlots.map((slot, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-md"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Day
                </label>
                <select
                  value={slot.day}
                  onChange={(e) =>
                    handleTimeSlotChange(index, "day", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                >
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    handleTimeSlotChange(index, "startTime", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) =>
                    handleTimeSlotChange(index, "endTime", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Available
                </label>
                <select
                  value={slot.isAvailable.toString()}
                  onChange={(e) =>
                    handleTimeSlotChange(index, "isAvailable", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                    !isEditing ? "bg-gray-50" : ""
                  }`}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Services */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Services Offered</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "General Consultation",
              "Follow-up Visit",
              "Emergency Consultation",
              "Prescription",
              "Medical Certificate",
              "Lab Test Review",
              "Health Checkup",
              "Telemedicine",
              "Video Consultation",
            ].map((service) => (
              <div key={service} className="flex items-center">
                <input
                  type="checkbox"
                  id={service}
                  value={service}
                  checked={formData.services.includes(service)}
                  onChange={handleServicesChange}
                  disabled={!isEditing}
                  className={`h-4 w-4 text-blue-600 border-gray-300 rounded ${
                    !isEditing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <label htmlFor={service} className="ml-2 text-sm text-gray-700">
                  {service}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Name
              </label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Phone
              </label>
              <input
                type="text"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                  !isEditing ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  hospitalName: doctorData.hospitalName || "",
                  chamberAddress: doctorData.chamberAddress || "",
                  consultationFee: doctorData.consultationFee || "",
                  bio: doctorData.bio || "",
                  services: doctorData.services || [],
                  availableTimeSlots: doctorData.availableTimeSlots || [],
                  emergencyContact: doctorData.emergencyContact || {
                    name: "",
                    phone: "",
                    relationship: "",
                  },
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DoctorProfile;
