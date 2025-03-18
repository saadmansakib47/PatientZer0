import {
  AppBar,
  Toolbar,
  styled,
  Button,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState, useContext } from "react";
import { useTheme } from "../../context/ThemeProvider";
import { DataContext } from "../../context/DataProvider";

const Component = styled(AppBar)(({ theme }) => ({
  background: theme.palette.background.paper,
  color: theme.palette.mode === "dark" ? "#fff" : "#000",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 2px 4px rgba(255, 255, 255, 0.1)"
      : "0 2px 4px rgba(0, 0, 0, 0.1)",
  position: "fixed",
  zIndex: 1000,
}));

const Container = styled(Toolbar)`
  justify-content: space-between;
  padding: 0 2rem;
`;

const NavLinks = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "2rem",

  "& > a": {
    color: theme.palette.mode === "dark" ? "#fff" : "#333",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "1rem",
    transition: "color 0.3s ease",

    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

const StyledButton = styled(Button)`
  text-transform: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  background: ${(props) => props.theme.palette.primary.main};
  color: white;

  &:hover {
    background: ${(props) => props.theme.palette.primary.dark};
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();
  const { account, logout: contextLogout } = useContext(DataContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateToProfile = () => {
    handleProfileMenuClose();
    navigate(`/profile/${account.username}`);
  };

  const logout = async () => {
    contextLogout();
    navigate("/account");
  };

  return (
    <Component>
      <Container>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            sx={{ display: { sm: "none" }, mr: 2 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: mode === "dark" ? "#fff" : "#1976d2",
              fontWeight: "bold",
              fontSize: "1.5rem",
            }}
          >
            BlogSpace
          </Link>
        </Box>

        <NavLinks
          sx={{
            display: { xs: mobileMenuOpen ? "flex" : "none", sm: "flex" },
            flexDirection: { xs: "column", sm: "row" },
            position: { xs: "absolute", sm: "static" },
            top: { xs: "64px", sm: "auto" },
            left: { xs: 0, sm: "auto" },
            right: { xs: 0, sm: "auto" },
            background: {
              xs: mode === "dark" ? "#1e1e1e" : "white",
              sm: "transparent",
            },
            padding: { xs: "1rem", sm: 0 },
            boxShadow: {
              xs:
                mode === "dark"
                  ? "0 2px 4px rgba(255,255,255,0.1)"
                  : "0 2px 4px rgba(0,0,0,0.1)",
              sm: "none",
            },
          }}
        >
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Tooltip
            title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          >
            <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                  }}
                >
                  {account.username ? account.username[0].toUpperCase() : "U"}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 180,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={navigateToProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </MenuItem>
              <MenuItem onClick={logout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Box>
        </NavLinks>
      </Container>
    </Component>
  );
};

export default Header;
