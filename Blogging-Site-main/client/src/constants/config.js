// API NOTIFICATION MESSAGES
export const API_NOTIFICATION_MESSAGES = {
  loading: {
    title: "Loading...",
    message: "Data is being loaded. Please wait",
  },
  success: {
    title: "Success",
    message: "Data successfully loaded",
  },
  requestFailure: {
    title: "Error!",
    message: "An error occur while parsing request data",
  },
  responseFailure: {
    title: "Error!",
    message:
      "An error occur while fetching response from server. Please try again",
  },
  networkError: {
    title: "Error!",
    message:
      "Unable to connect to the server. Please check internet connectivity and try again.",
  },
};

// API SERVICE URL
// SAMPLE REQUEST
// NEED SERVICE CALL: { url: "/", method: "POST/GET/PUT/DELETE" }
export const SERVICE_URLS = {
  userLogin: { url: "/login", method: "POST" },
  userSignup: { url: "/signup", method: "POST" },
  getAllPosts: { url: "/posts", method: "GET", params: true },
  getRefreshToken: { url: "/token", method: "POST" },
  uploadFile: { url: "/api/images/upload", method: "POST" },
  createPost: { url: "/create", method: "POST" },
  deletePost: { url: "/delete", method: "DELETE", query: true },
  getPostById: { url: "/post", method: "GET", query: true },
  newComment: { url: "/comment/new", method: "POST" },
  getAllComments: { url: "/comments", method: "GET", query: true },
  deleteComment: { url: "/comment/delete", method: "DELETE", query: true },
  updatePost: { url: "/update", method: "PUT", query: true },
  votePost: { url: "/post/vote", method: "POST", query: true },
  voteComment: { url: "/comment/vote", method: "POST", query: true },
  updateComment: { url: "/comment/update", method: "PUT", query: true },
  searchPosts: { url: "/posts/search", method: "GET", params: true },
  getUserProfile: { url: "/user", method: "GET", query: true },
  updateUserProfile: { url: "/user", method: "PUT", query: true },
  getUserStats: { url: "/user", method: "GET", query: true, subPath: "stats" },
};
