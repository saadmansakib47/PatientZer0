import { Box, styled } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const ParallaxContainer = styled(Box)`
  position: relative;
  width: 100%;
  min-height: 60vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ParallaxContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
`;

const ParallaxSection = ({ children, style }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 1]);

  return (
    <ParallaxContainer ref={ref} style={style}>
      <ParallaxContent style={{ opacity }}>{children}</ParallaxContent>
    </ParallaxContainer>
  );
};

export default ParallaxSection;
