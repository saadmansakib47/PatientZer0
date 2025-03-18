import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const ScrollAnimation = ({ children, delay = 0, direction = "up" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const getInitialY = () => {
    switch (direction) {
      case "up":
        return 50;
      case "down":
        return -50;
      default:
        return 0;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: getInitialY() }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: getInitialY() }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;
