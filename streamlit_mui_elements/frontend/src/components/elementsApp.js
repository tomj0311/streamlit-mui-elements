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

const EVENT_TYPES = {
  CLICK: 'click',
  CHANGE: 'change',
  BLUR: 'blur',
  AUTOCOMPLETE_CHANGE: 'autocomplete-change',
  SELECT_CHANGE: 'select-change'
};

const createEventPayload = (key, type, value) => ({
  key,
  type,
  value,
  timestamp: Date.now()
});

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
  try {
    let value;
    
    // Handle different input types
    switch (event?.target?.type) {
      case 'checkbox':
        value = event.target.checked;
        break;
      case 'radio':
        value = event.target.value;
        break;
      case 'button':
        value = 'clicked';
        break;
      default:
        value = event?.target?.value;
    }

    send(createEventPayload(key, eventType, value));
  } catch (error) {
    console.error('Event handling error:', error);
    send(createEventPayload(key, 'error', error.message));
  }
};

const createEventHandlers = (id, type) => {
  const handlers = {};

  if (!id) return handlers;

  switch (type) {
    case 'Autocomplete':
      handlers.onChange = (event, value, selectionData) => {
        send(createEventPayload(id, EVENT_TYPES.AUTOCOMPLETE_CHANGE, selectionData));
      };
      break;
    
    case 'Select':
      handlers.onChange = (event, selectionData) => {
        send(createEventPayload(id, EVENT_TYPES.SELECT_CHANGE, selectionData));
      };
      break;
    
    default:
      handlers.onClick = (e) => handleEvent(e, id, EVENT_TYPES.CLICK);
      handlers.onBlur = (e) => handleEvent(e, id, EVENT_TYPES.BLUR);
      handlers.onChange = (e) => handleEvent(e, id, EVENT_TYPES.CHANGE);
  }

  return handlers;
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

  // Efficiently create event handlers
  if (finalProps.id) {
    const eventHandlers = createEventHandlers(finalProps.id, type);
    
    // Preserve any existing handlers by creating wrapper functions
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      const originalHandler = finalProps[eventName];
      finalProps[eventName] = (e, ...args) => {
        handler(e, ...args);
        if (originalHandler) originalHandler(e, ...args);
      };
    });
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
