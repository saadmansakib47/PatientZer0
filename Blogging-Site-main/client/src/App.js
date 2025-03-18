import { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

//components
import DataProvider from "./context/DataProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import CreatePost from "./components/create/CreatePost";
import DetailView from "./components/details/DetailView";
import Update from "./components/create/Update";
import About from "./components/about/About";
import Contact from "./components/contact/Contact";
import Login from "./components/account/Login";
import Profile from "./components/profile/Profile";
import HealthProfile from "./components/profile/HealthProfile";

const PrivateRoute = ({ isAuthenticated, ...props }) => {
  const token = sessionStorage.getItem("accessToken");
  return isAuthenticated && token ? (
    <>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh" }}>
        <Outlet />
      </Box>
    </>
  ) : (
    <Navigate replace to="/account" />
  );
};

function App() {
  const [isAuthenticated, isUserAuthenticated] = useState(() => {
    // Check for existing authentication on startup
    const token = sessionStorage.getItem("accessToken");
    return !!token;
  });

  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Routes>
              <Route
                path="/account"
                element={<Login isUserAuthenticated={isUserAuthenticated} />}
              />

              <Route
                path="/"
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path="/" element={<Home />} />
              </Route>

              <Route
                path="/create"
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path="/create" element={<CreatePost />} />
              </Route>

              <Route
                path="/details/:id"
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path="/details/:id" element={<DetailView />} />
              </Route>

              <Route
                path="/update/:id"
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path="/update/:id" element={<Update />} />
              </Route>

              <Route
                path="/about"
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path="/about" element={<About />} />
              </Route>

              <Route
                path="/contact"
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path="/contact" element={<Contact />} />
              </Route>

              <Route
                path="/profile/:username"
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path="/profile/:username" element={<Profile />} />
              </Route>

              <Route
                path="/profile/health/:username"
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path="/profile/health/:username" element={<HealthProfile />} />
              </Route>
            </Routes>
          </Box>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
