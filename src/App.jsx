import React from "react";
import "./App.css";
import Table from "./Table.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";
function App() {
  let theme = createTheme({
    typography: {},
    palette: {
      primary: {
        main: "#fff",
        // contrastText: "#fff",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div style={{ margin: "50px" }}>
        <Table />
      </div>
    </ThemeProvider>
  );
}

export default App;
