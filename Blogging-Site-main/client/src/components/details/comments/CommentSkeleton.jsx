import { Box, Skeleton, styled } from "@mui/material";

const CommentSkeletonWrapper = styled(Box)(({ theme, depth = 0 }) => ({
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
}));

const Container = styled(Box)`
  display: flex;
  margin-bottom: 5px;
  align-items: flex-start;
  gap: 12px;
`;

const Content = styled(Box)`
  flex-grow: 1;
`;

const Header = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Actions = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const CommentSkeleton = ({ depth = 0, hasReplies = false }) => {
  return (
    <>
      <CommentSkeletonWrapper depth={depth}>
        <Container>
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation="wave"
          />
          <Content>
            <Header>
              <Skeleton
                variant="text"
                width={120}
                height={24}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={80}
                height={24}
                animation="wave"
              />
            </Header>
            <Skeleton
              variant="text"
              height={60}
              animation="wave"
              sx={{ marginBottom: 1 }}
            />
            <Actions>
              <Skeleton
                variant="rounded"
                width={80}
                height={32}
                animation="wave"
              />
              <Skeleton
                variant="rounded"
                width={80}
                height={32}
                animation="wave"
              />
            </Actions>
          </Content>
        </Container>
      </CommentSkeletonWrapper>
      {hasReplies && (
        <>
          <CommentSkeleton depth={depth + 1} />
          <CommentSkeleton depth={depth + 1} />
        </>
      )}
    </>
  );
};

export default CommentSkeleton;
