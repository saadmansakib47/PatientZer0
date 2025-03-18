import { useContext, useState } from "react";
import {
  Typography,
  Box,
  styled,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Collapse,
  Fade,
  Skeleton,
} from "@mui/material";
import {
  Delete,
  Edit,
  ThumbUp,
  ThumbDown,
  ThumbUpOutlined,
  ThumbDownOutlined,
  Reply as ReplyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

import { API } from "../../../service/api";
import { DataContext } from "../../../context/DataProvider";

const Component = styled(Box)(({ theme, depth = 0 }) => ({
  marginTop: "20px",
  marginLeft: depth * 40,
  background:
    theme.palette.mode === "dark" ? theme.palette.background.paper : "#f8f9fa",
  padding: "20px",
  borderRadius: "12px",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(0, 0, 0, 0.12)"
  }`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 2px 4px rgba(255, 255, 255, 0.05)"
      : "0 2px 4px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 8px rgba(255, 255, 255, 0.1)"
        : "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
}));

const Container = styled(Box)`
  display: flex;
  margin-bottom: 5px;
  align-items: flex-start;
  gap: 12px;
`;

const UserAvatar = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: "16px",
  fontWeight: 600,
}));

const CommentContent = styled(Box)`
  flex-grow: 1;
`;

const Name = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "16px",
  color: theme.palette.text.primary,
  display: "inline-block",
  marginRight: "10px",
}));

const StyledDate = styled(Typography)(({ theme }) => ({
  fontSize: "14px",
  color: theme.palette.text.secondary,
  display: "inline-block",
}));

const CommentText = styled(Typography)(({ theme }) => ({
  marginTop: "8px",
  color: theme.palette.text.primary,
  lineHeight: 1.6,
  fontSize: "15px",
  whiteSpace: "pre-wrap",
}));

const ActionButtons = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const ReplyButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ReplyForm = styled(Box)(({ theme }) => ({
  marginTop: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.3)"
      : "rgba(255, 255, 255, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  zIndex: 1,
}));

const ActionIconButton = styled(IconButton)(({ theme, color = "primary" }) => ({
  padding: "8px",
  color: theme.palette[color].main,
  borderRadius: "8px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: `${theme.palette[color].main}15`,
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
}));

const EditTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: "2px",
      },
    },
  },
}));

const Comment = ({ comment, setToggle, depth = 0 }) => {
  const { account } = useContext(DataContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [score, setScore] = useState(comment.score || 0);
  const [upvotes, setUpvotes] = useState(comment.upvotes || []);
  const [downvotes, setDownvotes] = useState(comment.downvotes || []);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.comments);
  const theme = useTheme();

  const isAuthor = account.username === comment.name;
  const hasUpvoted = upvotes.includes(account.username);
  const hasDownvoted = downvotes.includes(account.username);

  const handleVote = async (voteType) => {
    if (isVoting || !account.username) return;

    try {
      setIsVoting(true);
      setIsActionLoading(true);
      const response = await API.voteComment(comment._id, {
        username: account.username,
        voteType,
      });

      if (response.isSuccess) {
        setUpvotes(response.data.comment.upvotes);
        setDownvotes(response.data.comment.downvotes);
        setScore(response.data.comment.score);
      }
    } catch (error) {
      console.error("Error voting on comment:", error);
    } finally {
      setIsVoting(false);
      setIsActionLoading(false);
    }
  };

  const removeComment = async () => {
    if (!comment._id || !isAuthor) return;

    try {
      setIsDeleting(true);
      setIsActionLoading(true);
      const response = await API.deleteComment(comment._id);

      if (response.isSuccess) {
        setToggle((prev) => !prev);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
      setIsActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editedText.trim() || !isAuthor) return;

    try {
      setIsActionLoading(true);
      console.log("Updating comment:", {
        id: comment._id,
        comments: editedText.trim(),
      });

      const response = await API.updateComment({
        id: comment._id,
        comments: editedText.trim(),
      });

      if (response?.isSuccess) {
        setIsEditing(false);
        comment.comments = editedText.trim();
        setToggle((prev) => !prev);
      } else {
        console.error(
          "Failed to update comment:",
          response?.msg || "Unknown error"
        );
      }
    } catch (error) {
      console.error(
        "Error updating comment:",
        error?.response?.data?.msg || error?.msg || "Unknown error occurred"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !account.username) return;

    try {
      setIsSubmittingReply(true);
      setIsActionLoading(true);
      const response = await API.newComment({
        name: account.username,
        postId: comment.postId,
        comments: replyText,
        parentId: comment._id,
        date: new Date(),
      });

      if (response.isSuccess) {
        setReplyText("");
        setShowReplyForm(false);
        setToggle((prev) => !prev);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmittingReply(false);
      setIsActionLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Fade in={true} timeout={500}>
      <Component depth={depth}>
        {isActionLoading && (
          <LoadingOverlay>
            <CircularProgress size={24} />
          </LoadingOverlay>
        )}
        <Container>
          <UserAvatar>{getInitials(comment.name)}</UserAvatar>
          <CommentContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Name>{comment.name}</Name>
              <StyledDate>
                {formatDistanceToNow(new Date(comment.date), {
                  addSuffix: true,
                })}
              </StyledDate>
            </Box>

            {isEditing ? (
              <Box sx={{ mt: 2 }}>
                <EditTextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    startIcon={<CheckIcon />}
                    variant="contained"
                    size="small"
                    onClick={handleEdit}
                    disabled={!editedText.trim() || isActionLoading}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<CloseIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedText(comment.comments);
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <CommentText>{comment.comments}</CommentText>
            )}

            <ActionButtons>
              <Tooltip
                title={
                  account.username
                    ? hasUpvoted
                      ? "Remove Upvote"
                      : "Upvote"
                    : "Login to vote"
                }
              >
                <span>
                  <ActionIconButton
                    onClick={() => handleVote("upvote")}
                    disabled={isVoting || !account.username}
                    color="primary"
                  >
                    {hasUpvoted ? <ThumbUp /> : <ThumbUpOutlined />}
                  </ActionIconButton>
                </span>
              </Tooltip>

              <Typography variant="body2" sx={{ mx: 1 }}>
                {score}
              </Typography>

              <Tooltip
                title={
                  account.username
                    ? hasDownvoted
                      ? "Remove Downvote"
                      : "Downvote"
                    : "Login to vote"
                }
              >
                <span>
                  <ActionIconButton
                    onClick={() => handleVote("downvote")}
                    disabled={isVoting || !account.username}
                    color="error"
                  >
                    {hasDownvoted ? <ThumbDown /> : <ThumbDownOutlined />}
                  </ActionIconButton>
                </span>
              </Tooltip>

              <ReplyButton
                startIcon={<ReplyIcon />}
                onClick={() => setShowReplyForm(!showReplyForm)}
                disabled={!account.username}
              >
                Reply
              </ReplyButton>

              {isAuthor && (
                <>
                  <Tooltip title="Edit comment">
                    <ActionIconButton
                      onClick={() => setIsEditing(true)}
                      disabled={isActionLoading}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </ActionIconButton>
                  </Tooltip>

                  <Tooltip title="Delete comment">
                    <ActionIconButton
                      onClick={removeComment}
                      disabled={isActionLoading}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </ActionIconButton>
                  </Tooltip>
                </>
              )}
            </ActionButtons>

            <Collapse in={showReplyForm}>
              <ReplyForm>
                <EditTextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={isSubmittingReply}
                  variant="outlined"
                  size="small"
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleReply}
                    disabled={!replyText.trim() || isSubmittingReply}
                  >
                    {isSubmittingReply ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Post Reply"
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </ReplyForm>
            </Collapse>

            {comment.replies?.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                setToggle={setToggle}
                depth={depth + 1}
              />
            ))}
          </CommentContent>
        </Container>
      </Component>
    </Fade>
  );
};

export default Comment;
