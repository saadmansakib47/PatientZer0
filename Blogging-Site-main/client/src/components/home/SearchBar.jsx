import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  styled,
  InputAdornment,
  Stack,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { API } from "../../service/api";
import { debounce } from "lodash";
import FilterDropdown from "./FilterDropdown";

const SearchWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 900,
  margin: "20px auto",
  padding: "0 20px",
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
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

const SearchBar = ({ onSearch }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Debounce the search function to avoid too many API calls
  const debouncedSearch = useRef(
    debounce(async (searchTerm) => {
      if (!searchTerm) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await API.searchPosts({ query: searchTerm });
        if (response.isSuccess) {
          // Handle both array and object responses
          const searchData = response.data.data || response.data || [];
          setOptions(Array.isArray(searchData) ? searchData : []);
        } else {
          console.error("Search failed:", response);
          setOptions([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (inputValue) {
      debouncedSearch(inputValue);
    } else {
      setOptions([]); // Clear options when input is empty
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleOptionSelect = (event, value) => {
    if (value) {
      onSearch(value);
    }
  };

  return (
    <SearchWrapper>
      <Stack direction="row" spacing={2} alignItems="center">
        <StyledAutocomplete
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={handleOptionSelect}
          options={options || []}
          loading={loading}
          getOptionLabel={(option) => (option && option.title) || ""}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          noOptionsText={
            inputValue ? "No posts found" : "Start typing to search"
          }
          filterOptions={(x) => x} // Disable built-in filtering
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search posts..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <FilterDropdown />
      </Stack>
    </SearchWrapper>
  );
};

export default SearchBar;
