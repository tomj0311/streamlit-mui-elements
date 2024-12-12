import { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { alpha } from '@mui/material/styles';

const defaultTheme = createTheme();

// Utility function to generate tonal palette
const generateTonalPalette = (mainColor) => {
  const theme = createTheme({
    palette: {
      primary: { main: mainColor }
    }
  });

  // Generate different shades
  return {
    50: alpha(mainColor, 0.05),
    100: alpha(mainColor, 0.15),
    200: alpha(mainColor, 0.3),
    300: alpha(mainColor, 0.5),
    400: alpha(mainColor, 0.7),
    500: mainColor,
    600: alpha(mainColor, 0.9),
    700: alpha(mainColor, 0.95),
    800: alpha(mainColor, 0.97),
    900: alpha(mainColor, 0.99),
    main: mainColor,
    light: alpha(mainColor, 0.5),
    dark: alpha(mainColor, 0.9),
  };
};

const isPaletteColor = (color) => {
  return typeof color === 'string' && color.includes('.');
};

const getPaletteColor = (theme, colorString) => {
  if (!isPaletteColor(colorString)) return colorString;
  
  const [palette, shade] = colorString.split('.');
  const paletteObj = theme.palette[palette];
  
  if (!paletteObj) return colorString;
  return paletteObj[shade] || colorString;
};

const ElementsTheme = ({ children, theme }) => {
  const [elementsTheme, setElementsTheme] = useState(createTheme());

  useEffect(() => {
    if (theme !== undefined) {
      const palette = defaultTheme.palette;
      
      // Generate primary and secondary palettes
      const primaryPalette = generateTonalPalette(theme.primaryColor ?? palette.primary.main);
      const secondaryPalette = generateTonalPalette(theme.primaryColor ?? palette.primary.main);

      setElementsTheme(
        createTheme({
          palette: {
            mode: theme.base,
            primary: primaryPalette,
            secondary: secondaryPalette,
            background: {
              default: getPaletteColor(defaultTheme, theme.backgroundColor) ?? palette.background.default,
              paper: theme.base === "dark" 
                ? getPaletteColor(defaultTheme, theme.secondaryBackgroundColor) || palette.background.paper
                : palette.background.paper,
            },
            text: {
              primary: getPaletteColor(defaultTheme, theme.textColor) ?? palette.text.primary,
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
