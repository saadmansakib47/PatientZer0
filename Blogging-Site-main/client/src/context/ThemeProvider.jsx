import { createContext, useState, useMemo, useContext } from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create theme context
export const ThemeContext = createContext({
  toggleTheme: () => {},
  mode: "light",
});

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Get initial theme preference from localStorage or default to 'light'
  const [mode, setMode] = useState(
    localStorage.getItem("themeMode") || "light"
  );

  const colorMode = useMemo(
    () => ({
      toggleTheme: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // Light mode colors
                primary: {
                  main: "#1976d2",
                  light: "#42a5f5",
                  dark: "#1565c0",
                  contrastText: "#ffffff",
                },
                secondary: {
                  main: "#9c27b0",
                  light: "#ba68c8",
                  dark: "#7b1fa2",
                  contrastText: "#ffffff",
                },
                background: {
                  default: "#f8fafc",
                  paper: "#ffffff",
                  card: "#ffffff",
                },
                text: {
                  primary: "#1a1a1a",
                  secondary: "#666666",
                },
                divider: "rgba(0, 0, 0, 0.12)",
              }
            : {
                // Dark mode colors
                primary: {
                  main: "#90caf9",
                  light: "#e3f2fd",
                  dark: "#42a5f5",
                  contrastText: "#000000",
                },
                secondary: {
                  main: "#ce93d8",
                  light: "#f3e5f5",
                  dark: "#ab47bc",
                  contrastText: "#000000",
                },
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                  card: "#252525",
                },
                text: {
                  primary: "#ffffff",
                  secondary: "#b3b3b3",
                },
                divider: "rgba(255, 255, 255, 0.12)",
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 },
          h2: { fontSize: "2rem", fontWeight: 600, lineHeight: 1.3 },
          h3: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.3 },
          h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
          h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
          h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
          body1: { fontSize: "1rem", lineHeight: 1.6 },
          body2: { fontSize: "0.875rem", lineHeight: 1.6 },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: "background-color 0.3s ease, color 0.3s ease",
                scrollBehavior: "smooth",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "dark" ? "#252525" : "#ffffff",
                backgroundImage: "none",
                boxShadow:
                  mode === "dark"
                    ? "0 4px 6px rgba(255, 255, 255, 0.1)"
                    : "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow:
                    mode === "dark"
                      ? "0 6px 12px rgba(255, 255, 255, 0.15)"
                      : "0 6px 12px rgba(0, 0, 0, 0.15)",
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "8px",
                padding: "8px 16px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              },
              contained: {
                boxShadow:
                  mode === "dark"
                    ? "0 2px 4px rgba(255, 255, 255, 0.1)"
                    : "0 2px 4px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  boxShadow:
                    mode === "dark"
                      ? "0 4px 8px rgba(255, 255, 255, 0.15)"
                      : "0 4px 8px rgba(0, 0, 0, 0.15)",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  transition: "all 0.3s ease",
                  "&:hover fieldset": {
                    borderColor: mode === "dark" ? "#90caf9" : "#1976d2",
                  },
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "dark" ? "#1e1e1e" : "#ffffff",
                color: mode === "dark" ? "#ffffff" : "#000000",
                boxShadow:
                  mode === "dark"
                    ? "0 2px 4px rgba(255, 255, 255, 0.1)"
                    : "0 2px 4px rgba(0, 0, 0, 0.1)",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "dark" ? "#1e1e1e" : "#ffffff",
                backgroundImage: "none",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "dark" ? "#252525" : "#ffffff",
                backgroundImage: "none",
                boxShadow:
                  mode === "dark"
                    ? "0 8px 16px rgba(255, 255, 255, 0.1)"
                    : "0 8px 16px rgba(0, 0, 0, 0.1)",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
