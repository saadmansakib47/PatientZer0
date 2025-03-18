import { useState, useEffect, useContext } from "react";
import {
  Box,
  TextareaAutosize,
  Button,
  styled,
  useTheme,
  Typography,
  Avatar,
  Fade,
} from "@mui/material";

import { DataContext } from "../../../context/DataProvider";
import { API } from "../../../service/api";
import Comment from "./Comment";
import CommentSkeleton from "./CommentSkeleton";

const Container = styled(Box)`
  margin-top: 40px;
`;

const CommentForm = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "20px",
  alignItems: "flex-start",
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.background.paper : "#ffffff",
  padding: "24px",
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
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  backgroundColor: theme.palette.primary.main,
  fontSize: "16px",
  fontWeight: 600,
}));

const StyledTextArea = styled(TextareaAutosize)(({ theme }) => ({
  height: "100px !important",
  width: "100%",
  padding: "15px",
  borderRadius: "8px",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(0, 0, 0, 0.12)"
  }`,
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.background.paper : "#ffffff",
  color: theme.palette.text.primary,
  resize: "vertical",
  fontFamily: theme.typography.fontFamily,
  fontSize: "16px",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor:
      theme.palette.mode === "dark"
        ? theme.palette.primary.light
        : theme.palette.primary.main,
  },
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${
      theme.palette.mode === "dark"
        ? "rgba(144, 202, 249, 0.2)"
        : "rgba(25, 118, 210, 0.2)"
    }`,
  },
  "&::placeholder": {
    color: theme.palette.text.secondary,
  },
}));

const CommentButton = styled(Button)(({ theme }) => ({
  marginTop: "16px",
  height: 40,
  textTransform: "none",
  borderRadius: "8px",
  padding: "0 24px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 2px 4px rgba(255, 255, 255, 0.1)"
      : "0 2px 4px rgba(0, 0, 0, 0.1)",
}));

const CommentsContainer = styled(Box)(({ theme }) => ({
  marginTop: "32px",
}));

const NoComments = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.text.secondary,
  marginTop: "32px",
  fontSize: "16px",
}));

const initialValue = {
  name: "",
  postId: "",
  date: new Date(),
  comments: "",
};

const Comments = ({ post }) => {
  const theme = useTheme();
  const [comment, setComment] = useState(initialValue);
  const [comments, setComments] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useContext(DataContext);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const response = await API.getAllComments(post._id);
        if (response.isSuccess) {
          setComments(response.data);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (post._id) {
      getData();
    }
  }, [toggle, post._id]);

  const handleChange = (e) => {
    setComment({
      ...comment,
      name: account.username,
      postId: post._id,
      comments: e.target.value,
    });
  };

  const addComment = async () => {
    if (!comment.comments.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await API.newComment(comment);

      if (response.isSuccess) {
        setComment(initialValue);
        setToggle((prev) => !prev);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
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

  const renderSkeletons = () => {
    return (
      <>
        <CommentSkeleton hasReplies={true} />
        <CommentSkeleton />
        <CommentSkeleton hasReplies={true} />
      </>
    );
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Comments {!isLoading && comments.length > 0 && `(${comments.length})`}
      </Typography>

      <CommentForm>
        <UserAvatar>{getInitials(account.username)}</UserAvatar>
        <Box sx={{ flex: 1 }}>
          <StyledTextArea
            minRows={3}
            placeholder="Write a comment..."
            onChange={(e) => handleChange(e)}
            value={comment.comments}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <CommentButton
              variant="contained"
              color="primary"
              onClick={addComment}
              disabled={!comment.comments.trim() || isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </CommentButton>
          </Box>
        </Box>
      </CommentForm>

      <CommentsContainer>
        {isLoading ? (
          renderSkeletons()
        ) : comments.length > 0 ? (
          <Fade in={true} timeout={500}>
            <Box>
              {comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  setToggle={setToggle}
                />
              ))}
            </Box>
          </Fade>
        ) : (
          <Fade in={true} timeout={500}>
            <NoComments>No comments yet. Be the first to comment!</NoComments>
          </Fade>
        )}
      </CommentsContainer>
    </Container>
  );
};

export default Comments;
