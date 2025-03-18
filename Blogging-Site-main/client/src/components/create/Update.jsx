import React, { useState, useEffect } from "react";

import {
  Box,
  styled,
  TextareaAutosize,
  Button,
  FormControl,
  InputBase,
  Select,
  MenuItem,
  Typography,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { AddCircle as Add } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

import { API } from "../../service/api";
import { categories } from "../../constants/data";

const Container = styled(Box)(({ theme }) => ({
  margin: "50px 100px",
  [theme.breakpoints.down("md")]: {
    margin: 0,
  },
}));

const Image = styled("img")({
  width: "100%",
  height: "50vh",
  objectFit: "cover",
});

const StyledFormControl = styled(FormControl)`
  margin-top: 10px;
  display: flex;
  flex-direction: row;
`;

const InputTextField = styled(InputBase)`
  flex: 1;
  margin: 0 30px;
  font-size: 25px;
`;

const StyledTextArea = styled(TextareaAutosize)`
  width: 100%;
  border: none;
  margin-top: 50px;
  font-size: 18px;
  &:focus-visible {
    outline: none;
  }
`;

const CategorySection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const TagChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  fontWeight: 500,
}));

const initialPost = {
  title: "",
  description: "",
  picture: "",
  username: "codeforinterview",
  categories: "Tech",
  tags: ["Tech"],
  createdDate: new Date(),
};

const Update = () => {
  const navigate = useNavigate();

  const [post, setPost] = useState(initialPost);
  const [file, setFile] = useState("");
  const [imageURL, setImageURL] = useState("");

  const { id } = useParams();

  const url =
    "https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80";

  useEffect(() => {
    const fetchData = async () => {
      let response = await API.getPostById(id);
      if (response.isSuccess) {
        const fetchedPost = response.data;
        // Handle backward compatibility for tags
        if (!fetchedPost.tags || fetchedPost.tags.length === 0) {
          fetchedPost.tags = fetchedPost.categories
            ? [fetchedPost.categories]
            : [];
        }
        setPost(fetchedPost);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const getImage = async () => {
      if (file) {
        const data = new FormData();
        data.append("name", file.name);
        data.append("file", file);

        const response = await API.uploadFile(data);
        if (response.isSuccess) {
          post.picture = response.data;
          setImageURL(response.data);
        }
      }
    };
    getImage();
  }, [file]);

  const updateBlogPost = async () => {
    await API.updatePost(post);
    navigate(`/details/${id}`);
  };

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  return (
    <Container>
      <Image src={post.picture || url} alt="post" />

      <StyledFormControl>
        <label htmlFor="fileInput">
          <Add fontSize="large" color="action" />
        </label>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <InputTextField
          placeholder="Title"
          value={post.title}
          onChange={(e) => handleChange(e)}
          name="title"
        />
        <Button
          onClick={() => updateBlogPost()}
          variant="contained"
          color="primary"
        >
          Update
        </Button>
      </StyledFormControl>

      <CategorySection>
        <Typography variant="subtitle1" color="textSecondary">
          Tags:
        </Typography>
        <FormControl fullWidth>
          <Select
            multiple
            value={post.tags || []}
            onChange={(e) => setPost({ ...post, tags: e.target.value })}
            input={<OutlinedInput />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <TagChip
                    key={value}
                    label={value}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 48 * 4.5 + 8,
                  width: 250,
                },
              },
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.type}>
                {category.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CategorySection>

      <StyledTextArea
        rowsMin={5}
        placeholder="Tell your story..."
        name="description"
        onChange={(e) => handleChange(e)}
        value={post.description}
      />
    </Container>
  );
};

export default Update;
