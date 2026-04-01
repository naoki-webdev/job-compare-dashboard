import { Suspense, lazy } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { jaJP } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import PageLoader from "./components/PageLoader";

const JobsPage = lazy(() => import("./pages/JobsPage"));

const theme = createTheme(
  {
    shape: {
      borderRadius: 18,
    },
    typography: {
      fontFamily: ['"BIZ UDPGothic"', '"Noto Sans JP"', '"Segoe UI"', "sans-serif"].join(","),
      h3: {
        letterSpacing: "-0.03em",
      },
      h4: {
        letterSpacing: "-0.02em",
      },
    },
    palette: {
      mode: "light",
      primary: {
        main: "#1f6feb",
      },
      secondary: {
        main: "#0f766e",
      },
      background: {
        default: "#f7f9fc",
      },
    },
  },
  jaJP,
);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<PageLoader />}>
        <JobsPage />
      </Suspense>
    </ThemeProvider>
  );
}
