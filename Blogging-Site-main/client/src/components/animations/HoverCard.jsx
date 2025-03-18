import { Box, useTheme } from "@mui/material";
import { motion } from "framer-motion";

const HoverCard = ({ children, hoverScale = 1.05, hoverY = -5 }) => {
  const theme = useTheme();

  return (
    <motion.div
      style={{
        position: "relative",
        background: theme.palette.background.paper,
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 4px 6px rgba(255, 255, 255, 0.1)"
            : "0 4px 6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        cursor: "pointer",
      }}
      whileHover={{
        scale: hoverScale,
        y: hoverY,
        transition: {
          duration: 0.3,
          ease: [0.21, 0.47, 0.32, 0.98],
        },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};

export default HoverCard;
