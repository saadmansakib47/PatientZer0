import { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  styled,
  Skeleton,
  IconButton,
  Tooltip,
  Fade,
  useScrollTrigger,
  Zoom,
  Fab,
  Chip,
  Stack,
} from "@mui/material";
import {
  Delete,
  Edit,
  ThumbUp,
  ThumbDown,
  ThumbUpOutlined,
  ThumbDownOutlined,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";

import { API } from "../../service/api";

import { DataContext } from "../../context/DataProvider";

// components
import Comments from "./comments/Comments";

// Scroll to top button component
function ScrollTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Zoom in={trigger}>
      <Box
        role="presentation"
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1,
        }}
      >
        <Fab
          onClick={handleClick}
          color="primary"
          size="small"
          aria-label="scroll back to top"
          sx={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Box>
    </Zoom>
  );
}

const Container = styled(Box)(({ theme }) => ({
  margin: "50px auto",
  maxWidth: "1200px",
  padding: "0 20px",
  position: "relative",
  paddingTop: "64px",
  [theme.breakpoints.down("md")]: {
    margin: "20px auto",
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "60vh",
  borderRadius: "16px",
  overflow: "hidden",
  backgroundColor: theme.palette.mode === "dark" ? "#2d2d2d" : "#f5f5f5",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(255, 255, 255, 0.1)"
      : "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 48px rgba(255, 255, 255, 0.15)"
        : "0 12px 48px rgba(0, 0, 0, 0.15)",
  },
}));

const Image = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "all 0.5s ease",
  "&:hover": {
    transform: "scale(1.02)",
  },
});

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1,
}));

const ActionButton = styled(IconButton)(({ theme, variant = "primary" }) => ({
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette[variant].main}`,
  color: theme.palette[variant].main,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: theme.palette[variant].main,
    color: theme.palette.common.white,
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${theme.palette[variant].main}40`,
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "& svg": {
    fontSize: "24px",
    transition: "transform 0.2s ease",
  },
  "&:hover svg": {
    transform: "scale(1.1)",
  },
}));

const Heading = styled(Typography)(({ theme }) => ({
  fontSize: "42px",
  fontWeight: "700",
  textAlign: "center",
  margin: "50px 0 20px 0",
  color: theme.palette.text.primary,
  transition: "all 0.3s ease",
  lineHeight: "1.2",
  letterSpacing: "-0.5px",
  "&:hover": {
    transform: "scale(1.01)",
  },
}));

const Author = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  display: "flex",
  margin: "20px 0",
  alignItems: "center",
  padding: "16px",
  borderRadius: "12px",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.02)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)",
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
  },
}));

const Content = styled(Box)(({ theme }) => ({
  marginTop: "30px",
  padding: "32px",
  background: theme.palette.background.paper,
  borderRadius: "16px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 20px rgba(255, 255, 255, 0.05)"
      : "0 4px 20px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 32px rgba(255, 255, 255, 0.08)"
        : "0 8px 32px rgba(0, 0, 0, 0.08)",
  },
}));

const VoteContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginTop: "30px",
  justifyContent: "center",
  padding: "20px",
  borderRadius: "12px",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.02)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)",
  },
}));

const VoteCount = styled(Typography)(({ theme }) => ({
  fontSize: "24px",
  fontWeight: "600",
  color: theme.palette.text.primary,
  minWidth: "60px",
  textAlign: "center",
  padding: "4px 12px",
  borderRadius: "8px",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: "all 0.3s ease",
  padding: "12px",
  "&:hover": {
    transform: "scale(1.1)",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const TagChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 500,
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
}));

const DetailView = () => {
  const fallbackUrl =
    "https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80";

  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { account } = useContext(DataContext);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response = await API.getPostById(id);
        if (response.isSuccess) {
          setPost(response.data);

          // Set image source
          if (response.data.picture) {
            // Clean up any existing cache busting parameters
            const baseUrl = response.data.picture.split("?")[0];
            setImageSrc(baseUrl);
            setIsUsingFallback(false);
          } else {
            setImageSrc(fallbackUrl);
            setIsUsingFallback(true);
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setImageError(true);
        setImageSrc(fallbackUrl);
        setIsUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Reset image states when component mounts or id changes
    setImageLoaded(false);
    setImageError(false);
    setIsUsingFallback(false);
  }, [id]);

  const handleImageError = () => {
    // Only log error if we're not already using the fallback
    if (!isUsingFallback) {
      console.warn(`Image failed to load, using fallback image`);
      setImageError(true);
      setImageSrc(fallbackUrl);
      setIsUsingFallback(true);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleVote = async (voteType) => {
    if (isVoting) return;

    try {
      setIsVoting(true);
      console.log(
        "Sending vote request for post:",
        post._id,
        "type:",
        voteType
      );

      const response = await API.votePost(post._id, {
        username: account.username,
        voteType,
      });

      console.log("Vote response:", response); // Debug log

      if (response.isSuccess && response.data) {
        console.log("Vote successful, updating post with:", response.data);
        // The response.data contains the updated post data
        setPost((prevPost) => {
          const newPost = {
            ...prevPost,
            upvotes: response.data.upvotes || [],
            downvotes: response.data.downvotes || [],
            score: response.data.score || 0,
          };
          console.log("Updated post state:", newPost);
          return newPost;
        });
      } else {
        console.error("Vote failed:", response.msg);
        // Refresh the post data to ensure we're in sync
        console.log("Refreshing post data...");
        const refreshResponse = await API.getPostById(post._id);
        if (refreshResponse.isSuccess) {
          console.log(
            "Refresh successful, updating post with:",
            refreshResponse.data
          );
          setPost(refreshResponse.data);
        } else {
          console.error("Refresh failed:", refreshResponse.msg);
        }
      }
    } catch (error) {
      console.error("Error voting on post:", error);
      // Refresh the post data to ensure we're in sync
      try {
        console.log("Refreshing post data after error...");
        const refreshResponse = await API.getPostById(post._id);
        if (refreshResponse.isSuccess) {
          console.log(
            "Refresh successful, updating post with:",
            refreshResponse.data
          );
          setPost(refreshResponse.data);
        } else {
          console.error("Refresh failed:", refreshResponse.msg);
        }
      } catch (refreshError) {
        console.error("Error refreshing post data:", refreshError);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const deleteBlog = async () => {
    try {
      const response = await API.deletePost(post._id);
      if (response.isSuccess) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const hasUpvoted = post.upvotes?.includes(account.username);
  const hasDownvoted = post.downvotes?.includes(account.username);
  const score = post.score || 0;

  const isAuthor = account.username === post.username;

  return (
    <Fade in={true} timeout={800}>
      <Container>
        <ScrollTop />
        {loading ? (
          <Box sx={{ width: "100%" }}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height="60vh"
              sx={{ borderRadius: "16px", mb: 4 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="70%"
              height={60}
              sx={{ mx: "auto", mb: 2 }}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: "12px" }}
              animation="wave"
            />
          </Box>
        ) : (
          <>
            <ImageContainer>
              <ActionButtons>
                {isAuthor && (
                  <>
                    <Tooltip
                      title="Edit post"
                      placement="bottom"
                      TransitionComponent={Fade}
                      arrow
                    >
                      <ActionButton
                        variant="primary"
                        onClick={() => navigate(`/update/${post._id}`)}
                        aria-label="edit post"
                      >
                        <Edit />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip
                      title="Delete post"
                      placement="bottom"
                      TransitionComponent={Fade}
                      arrow
                    >
                      <ActionButton
                        variant="error"
                        onClick={() => deleteBlog()}
                        aria-label="delete post"
                      >
                        <Delete />
                      </ActionButton>
                    </Tooltip>
                  </>
                )}
              </ActionButtons>
              {!imageLoaded && !imageError && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                />
              )}
              <Image
                src={imageSrc}
                alt={post.title || "Post"}
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />
            </ImageContainer>

            <Content>
              <Heading>{post.title}</Heading>

              <Author>
                <Link
                  to={`/?username=${post.username}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      opacity: 0.8,
                    },
                  }}
                >
                  <Typography variant="h6">
                    Author:{" "}
                    <span style={{ fontWeight: 600 }}>{post.username}</span>
                  </Typography>
                </Link>
                <Typography
                  style={{
                    marginLeft: "auto",
                    opacity: 0.8,
                  }}
                >
                  {new Date(post.createdDate).toDateString()}
                </Typography>
              </Author>

              <TagsContainer>
                {post.tags && post.tags.length > 0 ? (
                  post.tags.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      color="primary"
                      variant="outlined"
                      clickable
                      onClick={() => navigate(`/?category=${tag}`)}
                    />
                  ))
                ) : post.categories ? (
                  <TagChip
                    label={post.categories}
                    color="primary"
                    variant="outlined"
                    clickable
                    onClick={() => navigate(`/?category=${post.categories}`)}
                  />
                ) : null}
              </TagsContainer>

              <VoteContainer>
                <Tooltip
                  title={hasUpvoted ? "Remove Upvote" : "Upvote"}
                  arrow
                  placement="top"
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                >
                  <span>
                    <StyledIconButton
                      onClick={() => handleVote("upvote")}
                      disabled={isVoting}
                      size="large"
                      color={hasUpvoted ? "primary" : "default"}
                    >
                      {hasUpvoted ? <ThumbUp /> : <ThumbUpOutlined />}
                    </StyledIconButton>
                  </span>
                </Tooltip>
                <VoteCount>{score}</VoteCount>
                <Tooltip
                  title={hasDownvoted ? "Remove Downvote" : "Downvote"}
                  arrow
                  placement="top"
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                >
                  <span>
                    <StyledIconButton
                      onClick={() => handleVote("downvote")}
                      disabled={isVoting}
                      size="large"
                      color={hasDownvoted ? "error" : "default"}
                    >
                      {hasDownvoted ? <ThumbDown /> : <ThumbDownOutlined />}
                    </StyledIconButton>
                  </span>
                </Tooltip>
              </VoteContainer>

              <Typography
                style={{
                  marginTop: "30px",
                  lineHeight: "1.8",
                  fontSize: "18px",
                  color: "inherit",
                  opacity: 0.9,
                }}
              >
                {post.description}
              </Typography>
            </Content>

            <Comments post={post} />
          </>
        )}
      </Container>
    </Fade>
  );
};

export default DetailView;
