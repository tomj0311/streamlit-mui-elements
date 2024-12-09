import React, { useEffect, useState } from "react";
import Mousetrap from "mousetrap";
import { ErrorBoundary } from "react-error-boundary";
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";
import { dequal } from "dequal/lite";
import { jsx } from "@emotion/react";

import ElementsResizer from "./elementsResizer";
import ElementsTheme from "./elementsTheme";

import loadMuiElements from "./modules/mui/elements";
import loadMuiIcons from "./modules/mui/icons";
import loadMuiLab from "./modules/mui/lab";

const loaders = {
  muiElements: loadMuiElements,
  muiIcons: loadMuiIcons,
  muiLab: loadMuiLab,
};

const send = (data) => {
  try {
    // Sanitize the data before sending
    const sanitizeValue = (value) => {
      if (value === null || value === undefined) return null;
      if (Array.isArray(value)) return value.map(sanitizeValue);
      if (typeof value === 'object' && !React.isValidElement(value)) {
        const clean = {};
        for (const key in value) {
          if (value[key] !== undefined && !React.isValidElement(value[key])) {
            clean[key] = sanitizeValue(value[key]);
          }
        }
        return clean;
      }
      return value;
    };

    const sanitizedData = {
      ...data,
      value: sanitizeValue(data.value),
      timestamp: Date.now()
    };

    // Final safety check
    const cleanData = JSON.parse(JSON.stringify(sanitizedData));
    Streamlit.setComponentValue(cleanData);
  } catch (error) {
    console.error('Failed to serialize data:', error);
    Streamlit.setComponentValue({
      error: 'Failed to serialize component data',
      timestamp: Date.now()
    });
  }
};

const handleEvent = (event, key, eventType) => {
  // Regular input handling
  let value;
  if (event.target.type === 'checkbox') {
    value = event.target.checked;
  } else {
    value = event.target.value;
  }

  // Handle different event types
  if (event.type === 'click' && event.target.type === 'button') {
    send({ key, value: 'clicked' });
  } else if (event.type === 'blur' && event.target.type === 'text') {
    send({ key, value });
  } else if (event.type === 'blur' && event.target.type === 'radio') {
    send({ key, value });
  } else if (event.type === 'change' && event.target.type !== 'text') {
    send({ key, value });
  }
};

const evaluateFunction = (funcString) => {
  // Create a context with MUI components
  const context = {
    TextField: loaders.muiElements("TextField"),
    React: React,
    createElement: React.createElement
  };
  
  const func = new Function(...Object.keys(context), `return ${funcString}`);
  return func(...Object.values(context));
};

const convertNode = (node) => {
  if (node === null || node === undefined) return node;
  if (typeof node !== "object") {
    // Handle function strings
    if (typeof node === "string" && node.startsWith("(params)")) {
      return evaluateFunction(node);
    }
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(convertNode);
  }
  if (node.type && node.module) {
    return renderElement(node);
  }

  // Plain object without type/module: recursively convert its values
  const newObj = {};
  for (const key in node) {
    newObj[key] = convertNode(node[key]);
  }
  return newObj;
};

const validateElement = (module, element) => {
  if (!loaders.hasOwnProperty(module)) {
    throw new Error(`Module "${module}" does not exist`);
  }

  const elementLoader = loaders[module];
  if (typeof element !== "string" || !elementLoader(element)) {
    console.error(`Element "${element}" does not exist in module "${module}"`);
    throw new Error(`Element "${element}" does not exist in module "${module}"`);
  }
};

const renderElement = (node) => {
  const { module, type, props = {}, children = [] } = node;

  validateElement(module, type);
  const LoadedElement = loaders[module](type);

  const renderedChildren = children.map(convertNode);
  const finalProps = { ...convertNode(props) };

  if (finalProps.id) {
    if (type === 'Autocomplete') {
      const originalOnChange = finalProps.onChange;
      finalProps.onChange = (event, value, selectionData) => {
        send({
          key: finalProps.id,
          type: 'autocomplete-change',
          value: selectionData
        });

        if (originalOnChange) {
          originalOnChange(event, value, selectionData);
        }
      };
    } else if (type === 'Select') {
      const originalOnChange = finalProps.onChange;
      finalProps.onChange = (event, selectionData) => {
        send({
          key: finalProps.id,
          type: 'select-change',
          value: selectionData  
        });

        if (originalOnChange) {
          originalOnChange(event, selectionData);
        }
      };
    } else {
      const originalOnClick = finalProps.onClick;
      finalProps.onClick = (e) => {
        handleEvent(e, finalProps.id, 'click');
        if (originalOnClick) originalOnClick(e);
      };

      const originalOnBlur = finalProps.onBlur;
      finalProps.onBlur = (e) => {
        handleEvent(e, finalProps.id, 'blur');
        if (originalOnBlur) originalOnBlur(e);
      };

      const originalOnChange = finalProps.onChange;
      finalProps.onChange = (e) => {
        handleEvent(e, finalProps.id, 'change');
        if (originalOnChange) originalOnChange(e);
      };
    }
  }

  return jsx(LoadedElement, finalProps, ...renderedChildren);
};

const ElementsApp = ({ args, theme }) => {
  const [uiTree, setUiTree] = useState([]);

  useEffect(() => {
    if (args.data) {
      try {
        const parsedData = JSON.parse(args.data);
        setUiTree(parsedData);
      } catch (error) {
        send({ error: `Failed to parse JSON: ${error.message}` });
      }
    }

    Mousetrap.bind("r", () => {
      send({});
    });

    return () => {
      Mousetrap.unbind("r");
    };
  }, [args.data]);

  return (
    <ElementsResizer>
      <ElementsTheme theme={theme}>
        <ErrorBoundary 
          fallback={
            <div style={{
              padding: '20px',
              margin: '20px',
              backgroundColor: '#ffebee',
              border: '1px solid #ef5350',
              borderRadius: '4px',
              minHeight: '800px',
              color: '#d32f2f'
            }}>
              An error occurred while rendering the component.
            </div>
          } 
          onError={(error) => send({ error: error.message })}
        >
          {uiTree.map((node, index) => (
            <React.Fragment key={index}>
              {renderElement(node)}
            </React.Fragment>
          ))}
        </ErrorBoundary>
      </ElementsTheme>
    </ElementsResizer>
  );
};

export default withStreamlitConnection(React.memo(ElementsApp, dequal));
