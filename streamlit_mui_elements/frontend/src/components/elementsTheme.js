import { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const defaultTheme = createTheme();

const ElementsTheme = ({ children, theme }) => {
  const [elementsTheme, setElementsTheme] = useState(createTheme());

  useEffect(() => {
    if (theme !== undefined) {
      const palette = defaultTheme.palette;

      setElementsTheme(
        createTheme({
          palette: {
            mode: theme.base,
            primary: {
              main: theme.primaryColor ?? palette.primary.main,
            },
            secondary: {
              main: theme.primaryColor ?? palette.primary.main,
            },
            background: {
              default: theme.backgroundColor ?? palette.background.default,
              paper:
                (theme.base === "dark" && theme.secondaryBackgroundColor) ||
                palette.background.paper,
            },
            text: {
              primary: theme.textColor ?? palette.text.primary,
            },
          },
        })
      );
    }
  }, [
    theme?.base,
    theme?.primaryColor,
    theme?.backgroundColor,
    theme?.secondaryBackgroundColor,
    theme?.textColor,
  ]);

  return <ThemeProvider theme={elementsTheme}>{children}</ThemeProvider>;
};

export default ElementsTheme;
