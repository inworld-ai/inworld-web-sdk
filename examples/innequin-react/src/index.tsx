import "./index.css";

import { ThemeProvider } from "@mui/material";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import theme from "./utils/theme";
import { SystemProvider } from "./contexts/SystemProvider";
import { InworldProvider } from "./contexts/InworldProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ThemeProvider theme={theme}>
    <SystemProvider>
      <InworldProvider>
        <App />
      </InworldProvider>
    </SystemProvider>
  </ThemeProvider>
);
