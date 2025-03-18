import {
  styled,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  CardActions,
  IconButton,
  Badge,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { API } from "../../../service/api";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    background:
      "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
  },
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: 16,
  left: 16,
  zIndex: 1,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
}));

const PostTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1.25rem",
  marginBottom: theme.spacing(1),
  lineHeight: 1.4,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  maxHeight: "2.8em",
}));

const PostDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  maxHeight: "4.2em",
  lineHeight: 1.4,
}));

const MetaInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginTop: "auto",
  color: theme.palette.text.secondary,
  "& .MuiSvgIcon-root": {
    fontSize: "1rem",
  },
}));

const MetaText = styled(Typography)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: "0.875rem",
});

const VoteButton = styled(IconButton)(({ theme, active: isActive }) => ({
  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
  transition: "color 0.2s ease, transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const VoteCount = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  minWidth: 30,
  textAlign: "center",
}));

const Post = ({ post }) => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState({
    upvotes: post.upvotes || [],
    downvotes: post.downvotes || [],
  });
  const [isVoting, setIsVoting] = useState(false);

  const url =
    post.picture ||
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=752&q=80";

  const handleCardClick = (e) => {
    // Don't navigate if clicking on vote buttons
    if (e.target.closest(".vote-button")) return;
    navigate(`/details/${post._id}`);
  };

  const handleVote = async (e, voteType) => {
    e.stopPropagation(); // Prevent card click when voting
    if (isVoting) return;

    try {
      setIsVoting(true);
      const response = await API.votePost({ id: post._id, voteType });
      if (response.isSuccess) {
        setVotes({
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes,
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const username = localStorage.getItem("username");
  const hasUpvoted = votes.upvotes.includes(username);
  const hasDownvoted = votes.downvotes.includes(username);

  return (
    <StyledCard onClick={handleCardClick} sx={{ cursor: "pointer" }}>
      <Box sx={{ position: "relative" }}>
        <StyledCardMedia image={url} title={post.title} />
        <CategoryChip label={post.categories} size="small" />
      </Box>
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pb: 1 }}
      >
        <PostTitle variant="h6">{post.title}</PostTitle>
        <PostDescription variant="body2">
          {post.description.length > 150
            ? `${post.description.substring(0, 150)}...`
            : post.description}
        </PostDescription>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <MetaInfo>
            <MetaText>
              <PersonIcon />
              {post.username}
            </MetaText>
            {post.createdDate && (
              <MetaText>
                <TimeIcon />
                {formatDistanceToNow(new Date(post.createdDate), {
                  addSuffix: true,
                })}
              </MetaText>
            )}
          </MetaInfo>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <VoteButton
                className="vote-button"
                size="small"
                disabled={isVoting}
                onClick={(e) => handleVote(e, "upvote")}
                sx={{ color: hasUpvoted ? "primary.main" : "text.secondary" }}
              >
                <ThumbUpIcon fontSize="small" />
              </VoteButton>
              <VoteCount>{votes.upvotes.length}</VoteCount>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <VoteButton
                className="vote-button"
                size="small"
                disabled={isVoting}
                onClick={(e) => handleVote(e, "downvote")}
                sx={{ color: hasDownvoted ? "error.main" : "text.secondary" }}
              >
                <ThumbDownIcon fontSize="small" />
              </VoteButton>
              <VoteCount>{votes.downvotes.length}</VoteCount>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default Post;
