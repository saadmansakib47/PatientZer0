import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  styled,
  useTheme,
} from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";

import { categories } from "../../constants/data";

const StyledTable = styled(Table)(({ theme }) => ({
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(224, 224, 224, 1)"
  }`,
  backgroundColor: theme.palette.background.paper,
  "& .MuiTableCell-root": {
    borderBottom: `1px solid ${
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(224, 224, 224, 1)"
    }`,
    color: theme.palette.text.primary,
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: "20px",
  width: "85%",
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textDecoration: "none",
  "&:hover": {
    background: theme.palette.primary.dark,
  },
}));

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: "inherit",
  display: "block",
  width: "100%",
  padding: "8px 0",
  transition: "color 0.3s ease",
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

const Categories = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const theme = useTheme();

  return (
    <>
      <Link
        to={`/create?category=${category || ""}`}
        style={{ textDecoration: "none" }}
      >
        <StyledButton variant="contained">Create Blog</StyledButton>
      </Link>

      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.02)",
                fontWeight: "bold",
              }}
            >
              <StyledLink to={"/"}>All Categories</StyledLink>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>
                <StyledLink
                  to={`/?category=${cat.type}`}
                  sx={{
                    color:
                      category === cat.type
                        ? theme.palette.primary.main
                        : "inherit",
                  }}
                >
                  {cat.type}
                </StyledLink>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </>
  );
};

export default Categories;
