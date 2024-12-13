import React from "react";
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '@mui/material/styles';

export const PlotComponent = ({ data, layout, config, ...rest }) => {
  const plotRef = React.useRef();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  React.useEffect(() => {
    const element = plotRef.current;
    
    if (element) {
      const themeLayout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { 
          color: theme.palette.text.primary,
          family: theme.typography.fontFamily
        },
        margin: {
          t: 10,  // Increase top margin
          r: 20,
          l: 40,
          b: 40
        },
        dragmode: 'pan',  // Changed from 'zoom' to 'pan'
        ...layout
      };

      // Define an array of theme colors
      const colors = [
        theme.palette.primary.main,     // First trace
        theme.palette.primary.light,    // Second trace
        theme.palette.secondary.main,   // Third trace
        theme.palette.secondary.light,  // Fourth trace
        theme.palette.info.main,       // Fifth trace
        theme.palette.info.light       // Sixth trace
      ];

      // Modified themedData mapping
      const themedData = (data || []).map((trace, index) => ({
        ...trace,
        marker: {
          color: colors[index % colors.length], // Cycle through colors
          ...trace.marker
        }
      }));

      Plotly.newPlot(
        element, 
        themedData, 
        themeLayout, 
        {
          responsive: true,
          displayModeBar: false, 
          scrollZoom: true,  
          dragmode: 'pan',  
          editable: false,
          hovermode: 'closest'  
        }
      );

      return () => {
        if (element) {
          Plotly.purge(element);
        }
      };
    }
  }, [data, layout, config, isDark, theme]);

  // Remove the modebar CSS styling since we're not using it anymore
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .js-plotly-plot .plotly {
        margin-top: 0 !important;  /* Remove top margin since no modebar */
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  return <div ref={plotRef} {...rest} />;
};