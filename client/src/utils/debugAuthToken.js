// Utility functions to help debug auth token issues

export const checkAuthToken = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("=== AUTH DEBUG INFO ===");
  console.log("Token exists:", !!token);
  if (token) {
    try {
      // Check if token is in correct JWT format
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.warn(
          "WARNING: Token is not in valid JWT format (should have 3 parts separated by dots)"
        );
      }

      console.log(
        "Token format:",
        parts.length === 3 ? "Valid JWT format" : "Invalid format"
      );
      console.log("Token first 10 chars:", token.substring(0, 10) + "...");

      // Try to decode payload (middle part)
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token payload:", {
          userId: payload._id,
          email: payload.email,
          role: payload.role,
          exp: new Date(payload.exp * 1000).toLocaleString(),
          isExpired: Date.now() > payload.exp * 1000,
        });
      }
    } catch (e) {
      console.error("Error parsing token:", e);
    }
  }

  console.log("User data exists:", !!user);
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log("User data:", {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      });
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }

  console.log("=== END DEBUG INFO ===");

  return {
    hasToken: !!token,
    hasUserData: !!user,
  };
};

export default { checkAuthToken };
