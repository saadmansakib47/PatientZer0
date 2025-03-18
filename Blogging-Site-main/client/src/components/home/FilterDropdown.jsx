import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { categories } from "../../constants/data";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  backgroundColor: theme.palette.background.paper,
  borderRadius: "12px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    transition: "box-shadow 0.3s ease",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    "&.Mui-focused": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
}));

const FilterDropdown = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "";

  const handleChange = (event) => {
    const category = event.target.value;
    if (category && category !== "All") {
      navigate(`/?category=${category}`);
    } else {
      navigate("/");
    }
  };

  return (
    <StyledFormControl variant="outlined" size="medium">
      <InputLabel id="category-filter-label">Filter by Category</InputLabel>
      <Select
        labelId="category-filter-label"
        id="category-filter"
        value={currentCategory === "" ? "All" : currentCategory}
        onChange={handleChange}
        label="Filter by Category"
      >
        <MenuItem value="All">All Categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.type}>
            {category.type}
          </MenuItem>
        ))}
      </Select>
    </StyledFormControl>
  );
};

export default FilterDropdown;
