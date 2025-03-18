import { Grid, Box, Typography } from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";
import { API } from "../../../service/api";
import AnimatedPostCard from "./AnimatedPostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { useInView } from "react-intersection-observer";
import { useLocation } from "react-router-dom";

const POSTS_PER_PAGE = 9;

const Posts = () => {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 100,
  });

  // Update selected category when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "";
    if (selectedCategory !== category) {
      setSelectedCategory(category);
      setInitialLoading(true); // Reset loading state when category changes
    }
  }, [location.search]);

  const fetchPosts = useCallback(
    async (pageNum) => {
      if (!mountedRef.current || loadingRef.current) return;

      try {
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        // Only include category in the query if it's not empty
        const queryParams = {
          page: pageNum,
          limit: POSTS_PER_PAGE,
        };
        if (selectedCategory) {
          queryParams.category = selectedCategory;
        }

        console.log("Fetching posts with params:", queryParams);
        const response = await API.getAllPosts(queryParams);
        console.log("API response:", response);

        if (!mountedRef.current) return;

        if (response && response.isSuccess) {
          // Handle the response data
          const responseData = response.data || {};

          // Extract posts array with fallback to empty array
          let postsData = [];
          if (responseData.posts && Array.isArray(responseData.posts)) {
            postsData = responseData.posts;
          } else if (Array.isArray(responseData)) {
            postsData = responseData;
          }

          // Extract pagination data with fallbacks
          const paginationData = responseData.pagination || {};
          const totalPagesCount = paginationData.pages || 1;

          console.log("Processed posts data:", postsData);
          setTotalPages(totalPagesCount);

          if (pageNum === 1) {
            setPosts(postsData);
          } else {
            setPosts((prevPosts) => {
              // Ensure prevPosts is an array
              const prevPostsArray = Array.isArray(prevPosts) ? prevPosts : [];

              // Filter out duplicates
              const newPosts = postsData.filter(
                (newPost) =>
                  !prevPostsArray.some(
                    (existingPost) => existingPost._id === newPost._id
                  )
              );
              return [...prevPostsArray, ...newPosts];
            });
          }
          setHasMore(pageNum < totalPagesCount);
        } else {
          console.error("API response error:", response);
          setError(response?.msg || "Failed to load posts");
          setPosts([]);
          setHasMore(false);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        console.error("Error fetching posts:", err);
        setError(err?.msg || "Failed to load posts. Please try again later.");
        setPosts([]);
        setHasMore(false);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitialLoading(false);
          loadingRef.current = false;
        }
      }
    },
    [selectedCategory]
  );

  // Initial fetch
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1);
  }, [selectedCategory, fetchPosts]);

  // Handle infinite scroll
  useEffect(() => {
    const shouldLoadMore =
      inView && hasMore && !loadingRef.current && page < totalPages;

    if (shouldLoadMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [inView, hasMore, page, totalPages, fetchPosts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Render loading skeletons
  const renderSkeletons = (count) => (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} key={`skeleton-${index}`}>
          <PostCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );

  // Ensure posts is always an array
  const safePosts = Array.isArray(posts) ? posts : [];

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {selectedCategory && selectedCategory !== "All" && (
        <Typography variant="h6" sx={{ mb: 3 }}>
          Showing posts tagged with "{selectedCategory}"
        </Typography>
      )}

      {initialLoading ? (
        // Show skeleton loading for initial load
        renderSkeletons(4)
      ) : safePosts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6">
            No posts found{" "}
            {selectedCategory ? `for category "${selectedCategory}"` : ""}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {safePosts.map((post, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                key={`${post._id || index}-${Date.now()}-${index}`}
                sx={{ minHeight: 600 }}
              >
                <AnimatedPostCard post={post} />
              </Grid>
            ))}
          </Grid>

          {/* Loading indicator for infinite scroll */}
          {hasMore && (
            <Box
              ref={ref}
              sx={{
                py: 4,
                width: "100%",
              }}
            >
              {loading && renderSkeletons(2)}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Posts;
