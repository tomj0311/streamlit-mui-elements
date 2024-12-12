import React from "react";
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '@mui/material/styles';

export const PlotComponent = ({ data, layout, config, ...rest }) => {
  const plotRef = React.useRef();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  React.useEffect(() => {
    if (plotRef.current) {
      const themeLayout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { 
          color: theme.palette.text.primary,
          family: theme.typography.fontFamily
        },
        margin: {
          t: 40,  // Increase top margin
          r: 20,
          l: 40,
          b: 40
        },
        dragmode: 'pan',  // Changed from 'zoom' to 'pan'
        ...layout
      };

      const themedData = (data || []).map((trace, index) => ({
        ...trace,
        marker: {
          color: index === 0 ? theme.palette.primary.main : theme.palette.primary.light,
          ...trace.marker
        }
      }));

      Plotly.newPlot(
        plotRef.current, 
        themedData, 
        themeLayout, 
        {
          responsive: true,
          displayModeBar: false,  // Hide modebar
          scrollZoom: true,  // Keep scroll zoom
          dragmode: 'pan',  // Changed from 'zoom' to 'pan'
          editable: false,
          hovermode: 'closest'  // Enable hover interactions
        }
      );

      return () => {
        if (plotRef.current) {
          Plotly.purge(plotRef.current);
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

export const createAutocompleteComponent = (module) => props => {
  const {
    onChange,
    options = [],
    value,
    ...rest
  } = props;

  const handleChange = (event, newValue) => {
    const selectedIndices = Array.isArray(newValue) 
      ? newValue.map(v => options.findIndex(opt => 
          typeof opt === 'object' ? opt.value === v.value : opt === v
        ))
      : newValue ? [options.findIndex(opt => 
          typeof opt === 'object' ? opt.value === newValue.value : opt === newValue
        )] : [];

    const selectionData = {
      selected: newValue,
      selectedIndices,
      totalSelected: Array.isArray(newValue) ? newValue.length : (newValue ? 1 : 0)
    };

    if (onChange) {
      onChange(event, newValue, selectionData);
    }
  };

  return React.createElement(module.default, {
    ...rest,
    options,
    value,
    onChange: handleChange,
    getOptionLabel: (option) => {
      if (option == null) return '';
      if (typeof option === 'object' && option.label) return option.label;
      return String(option);
    },
    isOptionEqualToValue: (option, value) => {
      if (!option || !value) return false;
      if (option === value) return true;
      if (typeof option === 'object' && typeof value === 'object') {
        return option.value === value.value;
      }
      return false;
    }
  });
};

export const createSelectComponent = (module) => props => {
  const {
    onChange,
    options = [],
    value,
    children,
    ...rest
  } = props;

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    const selectedOption = React.Children.toArray(children)
      .find(child => child.props.value === selectedValue);

    const selectionData = {
      value: selectedValue,
      option: selectedOption?.props?.id || '',
      label: selectedOption?.props?.children || selectedValue
    };

    if (onChange) {
      onChange(event, selectionData);
    }
  };

  return React.createElement(module.default, {
    ...rest,
    value,
    onChange: handleChange,
    children
  });
};
