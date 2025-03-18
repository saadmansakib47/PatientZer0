import React, { useState, useEffect, useContext, useRef } from "react";
import {
  TextField,
  Box,
  Button,
  Typography,
  styled,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import { API } from "../../service/api";
import { DataContext } from "../../context/DataProvider";

const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100vh",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
      : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
}));

const FormContainer = styled(motion.div)(({ theme }) => ({
  width: "100%",
  maxWidth: "400px",
  margin: "20px",
  padding: "2rem",
  borderRadius: "16px",
  background: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 30px rgba(255, 255, 255, 0.1)"
      : "0 4px 30px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(5px)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(255, 255, 255, 0.7)"
  }`,
}));

const Logo = styled("img")({
  width: 80,
  height: 80,
  margin: "0 auto 24px",
  display: "block",
  borderRadius: "50%",
  objectFit: "cover",
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: "1rem",
  "& .MuiOutlinedInput-root": {
    transition: "all 0.3s ease",
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  width: "100%",
  padding: "12px",
  marginTop: "1rem",
  borderRadius: "8px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: "all 0.3s ease",
  "&:hover": {
    background: theme.palette.primary.dark,
    transform: "translateY(-2px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 15px rgba(255, 255, 255, 0.1)"
        : "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
}));

const SwitchButton = styled(Button)(({ theme }) => ({
  width: "100%",
  padding: "12px",
  marginTop: "1rem",
  borderRadius: "8px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 500,
  background: "transparent",
  border: `2px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
  transition: "all 0.3s ease",
  "&:hover": {
    background: "transparent",
    borderColor: theme.palette.primary.dark,
    color: theme.palette.primary.dark,
  },
}));

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: "0.875rem",
  marginTop: "0.5rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
}));

const loginInitialValues = {
  username: "",
  password: "",
};

const signupInitialValues = {
  name: "",
  username: "",
  password: "",
};

const Login = ({ isUserAuthenticated }) => {
  const mountedRef = useRef(true);
  const [login, setLogin] = useState(loginInitialValues);
  const [signup, setSignup] = useState(signupInitialValues);
  const [error, showError] = useState("");
  const [account, toggleAccount] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAccount } = useContext(DataContext);
  const theme = useTheme();

  const imageURL =
    "https://t3.ftcdn.net/jpg/01/62/59/04/360_F_162590462_StuNG5boff6MVrZOCmbnDv8HPNfITqZl.jpg";

  useEffect(() => {
    showError("");
  }, [login, signup]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onValueChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const onInputChange = (e) => {
    setSignup({ ...signup, [e.target.name]: e.target.value });
  };

  const loginUser = async () => {
    if (!login.username || !login.password) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      showError("");
      let response = await API.userLogin(login);
      if (response.isSuccess) {
        sessionStorage.setItem("accessToken", response.data.accessToken);
        sessionStorage.setItem("refreshToken", response.data.refreshToken);

        const accountData = {
          name: response.data.name,
          username: response.data.username,
        };
        sessionStorage.setItem("account", JSON.stringify(accountData));

        if (mountedRef.current) {
          setAccount(accountData);
          isUserAuthenticated(true);
          setLogin(loginInitialValues);
          navigate("/");
        }
      } else {
        if (mountedRef.current) {
          showError(response.msg || "Invalid credentials");
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        showError("Login failed. Please try again.");
        console.error("Login error:", error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signupUser = async () => {
    if (!signup.username || !signup.password || !signup.name) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      showError("");
      let response = await API.userSignup(signup);
      if (response.isSuccess) {
        if (mountedRef.current) {
          setSignup(signupInitialValues);
          toggleAccount("login");
        }
      } else {
        if (mountedRef.current) {
          showError(response.msg || "Signup failed");
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        showError("Signup failed. Please try again.");
        console.error("Signup error:", error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const toggleSignup = () => {
    if (mountedRef.current) {
      showError("");
      account === "signup" ? toggleAccount("login") : toggleAccount("signup");
    }
  };

  return (
    <Container>
      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo src={imageURL} alt="logo" />
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 3 }}
        >
          {account === "login" ? "Welcome Back" : "Create Account"}
        </Typography>

        <AnimatePresence mode="wait">
          {account === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <StyledTextField
                variant="outlined"
                fullWidth
                name="username"
                label="Username"
                value={login.username}
                onChange={onValueChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <StyledTextField
                variant="outlined"
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={login.password}
                onChange={onValueChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <SubmitButton
                onClick={loginUser}
                disabled={loading}
                startIcon={
                  loading && <CircularProgress size={20} color="inherit" />
                }
              >
                {loading ? "Signing in..." : "Sign In"}
              </SubmitButton>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StyledTextField
                variant="outlined"
                fullWidth
                name="name"
                label="Name"
                value={signup.name}
                onChange={onInputChange}
              />
              <StyledTextField
                variant="outlined"
                fullWidth
                name="username"
                label="Username"
                value={signup.username}
                onChange={onInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <StyledTextField
                variant="outlined"
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={signup.password}
                onChange={onInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <SubmitButton
                onClick={signupUser}
                disabled={loading}
                startIcon={
                  loading && <CircularProgress size={20} color="inherit" />
                }
              >
                {loading ? "Creating account..." : "Create Account"}
              </SubmitButton>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <ErrorText>{error}</ErrorText>}

        <SwitchButton onClick={toggleSignup}>
          {account === "signup"
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </SwitchButton>
      </FormContainer>
    </Container>
  );
};

export default Login;
