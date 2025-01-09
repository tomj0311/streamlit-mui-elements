import React, { useEffect, useState } from "react";
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
  SELECT_CHANGE: 'select-change',
  FILE_CHANGE: 'file-change',  // Add new event type
  FILTER_CHANGE: 'filter-change',
  SORT_CHANGE: 'sort-change',
  PAGINATION_CHANGE: 'pagination-change'
};

const sanitizeValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'function') {
    return '[Function]';
  }
  
  if (value instanceof File) {
    return {
      name: value.name,
      type: value.type,
      size: value.size
    };
  }
  
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  
  if (typeof value === 'object') {
    const cleaned = {};
    for (const [key, val] of Object.entries(value)) {
      cleaned[key] = sanitizeValue(val);
    }
    return cleaned;
  }
  
  return value;
};

const createEventPayload = (key, type, value) => ({
  key,
  type,
  value,
  timestamp: Date.now()
});

const send = async (data) => {
  try {
    const sanitizedData = {
      ...data,
      value: sanitizeValue(data.value),
      formEvents: data.formEvents ? sanitizeValue(data.formEvents) : null,
      timestamp: Date.now()
    };
    
    // Send data to local event server if configured
    const eventPort = 8500;
    if (eventPort) {
      await fetch(`http://localhost:${eventPort}/api/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedData)
      });
    }

    Streamlit.setComponentValue(sanitizedData);
    
  } catch (error) {
    console.error('Failed to serialize data:', error);
    Streamlit.setComponentValue({
      error: 'Failed to serialize component data',
      timestamp: Date.now()
    });
  }
};

const handleFileEvent = async (event, key) => {
  try {
    if (!event?.target?.files?.length) return;

    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      const fileData = {
        key: key,
        type: EVENT_TYPES.FILE_CHANGE,
        value: {
          result: reader.result,
          name: file.name,
          type: file.type,
          size: file.size
        },
        timestamp: Date.now()
      };
      
      send(fileData);
    };

    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error('File handling error:', error);
    send({
      key: key,
      type: 'error',
      value: error.message,
      timestamp: Date.now()
    });
  }
};

const evaluateFunction = (funcString) => {
  // Create a context with MUI components
  const context = {
    TextField: loaders.muiElements("TextField"),
    React: React,
    createElement: React.createElement
  };

  // eslint-disable-next-line 
  const func = new Function(...Object.keys(context), `return ${funcString}`);
  return func(...Object.values(context));
};

const convertNode = (node, renderElement) => {
  if (node === null || node === undefined) return node;
  if (typeof node !== "object") {
    if (typeof node === "string" && node.startsWith("(params)")) {
      return evaluateFunction(node);
    }
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(n => convertNode(n, renderElement));
  }
  if (node.type && node.module) {
    return renderElement(node);
  }

  const newObj = {};
  for (const key in node) {
    newObj[key] = convertNode(node[key], renderElement);
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

const preprocessJsonString = (jsonString) => {
  try {
    // First try to locate any NaN values
    console.debug('Starting JSON preprocessing');
    
    // Convert standalone NaN values to null using multiple patterns
    let processed = jsonString
      // Handle key-value pairs with NaN
      .replace(/"[^"]+"\s*:\s*NaN/g, match => match.replace(/NaN$/, 'null'))
      // Handle array elements that are NaN
      .replace(/,\s*NaN\s*,/g, ',null,')
      // Handle NaN at start of array
      .replace(/\[\s*NaN\s*,/g, '[null,')
      // Handle NaN at end of array
      .replace(/,\s*NaN\s*\]/g, ',null]')
      // Handle single NaN in array
      .replace(/\[\s*NaN\s*\]/g, '[null]')
      // Handle any remaining NaN values
      .replace(/:\s*NaN\b/g, ': null');

    console.debug('Preprocessing complete');
    return processed;
  } catch (error) {
    console.error('Error during preprocessing:', error);
    throw error;
  }
};

const ElementsApp = ({ args, theme }) => {
  const [uiTree, setUiTree] = useState([]);
  const [formEvents, setFormEvents] = useState({});

  const handleFormEvent = (eventData) => {
    setFormEvents(prev => ({
      ...prev,
      [eventData.key]: {
        id: eventData.key,
        value: eventData.value
      }
    }));
  };

  const handleEvent = async (event, key, eventType, props = {}) => {
    try {
      let value;
      
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

      // Check if this element has type="submit"
      if (props.type === 'submit') {
        await send({
          key,
          type: props.type,
          value,
          formEvents
        });
      } else {
        if (value !== undefined && value !== null && value !== '') {
          handleFormEvent({
            key,
            value
          });
        }
      }

    } catch (error) {
      console.error('Event handling error:', error);
      await send(createEventPayload(key, 'error', error.message));
    }
  };

  const createEventHandlers = (id, type, props) => {
    const handlers = {};

    if (!id) return handlers;

    switch (type) {
      case 'Autocomplete':
        handlers.onChange = (event, value, selectionData) => {
          if (props.type === 'submit') {
            send({ key: id, type: props.type, value: selectionData });
          } else {
            handleFormEvent({
              key: id,
              value: selectionData
            });
          }
        };
        break;
      
      case 'Select':
        handlers.onChange = (event, selectionData) => {
          if (props.type === 'submit') {
            send({ key: id, type: props.type, value: selectionData });
          } else {
            handleFormEvent({
              key: id,
              value: selectionData
            });
          }
        };
        break;

      case 'Input':
        if (props?.type === 'file') {
          handlers.onChange = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (e?.target?.files?.length) {
              await handleFileEvent(e, id);
              e.target.value = '';
            }
          };
          handlers.onClick = (e) => {
            e.stopPropagation();
          };
        } else {
          handlers.onChange = (e) => handleEvent(e, id, EVENT_TYPES.CHANGE, props);
          handlers.onClick = (e) => handleEvent(e, id, EVENT_TYPES.CLICK, props);
        }
        break;
      
      case 'DataGrid':
        handlers.onFilterModelChange = (filterModel) => {
          send(createEventPayload(id, EVENT_TYPES.FILTER_CHANGE, filterModel));
        };
        
        handlers.onSortModelChange = (sortModel) => {
          send(createEventPayload(id, EVENT_TYPES.SORT_CHANGE, sortModel));
        };
        
        handlers.onPaginationModelChange = (paginationModel) => {
          send(createEventPayload(id, EVENT_TYPES.PAGINATION_CHANGE, paginationModel));
        };
        break;

      default:
        handlers.onClick = (e) => handleEvent(e, id, EVENT_TYPES.CLICK, props);
        handlers.onChange = (e) => handleEvent(e, id, EVENT_TYPES.CHANGE, props);
    }

    return handlers;
  };

  const renderElement = (node) => {
    const { module, type, props = {}, children = [] } = node;

    validateElement(module, type);
    const LoadedElement = loaders[module](type);

    const renderedChildren = children.map(child => convertNode(child, renderElement));
    const finalProps = { ...convertNode(props, renderElement) };

    // Special handling for file inputs
    if (type === 'Input' && finalProps.type === 'file') {
      finalProps.key = `file-input-${Date.now()}`;
      finalProps.onClick = (e) => e.stopPropagation();
    }

    if (finalProps.id) {
      const eventHandlers = createEventHandlers(finalProps.id, type, finalProps);
      if (type === 'DataGrid') {
        finalProps.components = { ...finalProps.components };
        Object.entries(eventHandlers).forEach(([eventName, handler]) => {
          if (handler) {
            const existingHandler = finalProps[eventName];
            finalProps[eventName] = (...args) => {
              if (existingHandler) existingHandler(...args);
              handler(...args);
            };
          }
        });
      } else {
        Object.assign(finalProps, eventHandlers);
      }
    }

    return jsx(LoadedElement, finalProps, ...renderedChildren);
  };

  useEffect(() => {
    if (args.data) {
      try {
        // Log the problematic areas
        const nanMatches = args.data.match(/NaN/g);
        if (nanMatches) {
          console.debug('Found NaN values:', nanMatches.length);
        }

        const cleanedData = preprocessJsonString(args.data);
        
        // Verify the cleaning worked
        if (cleanedData.includes('NaN')) {
          console.error('NaN values still present after preprocessing');
        }

        const parsedData = JSON.parse(cleanedData);
        setUiTree(parsedData);
      } catch (error) {
        console.error('Parse error:', {
          message: error.message,
          location: error.position,
          context: args.data.substring(
            Math.max(0, error.position - 100),
            Math.min(args.data.length, error.position + 100)
          )
        });
        send({ error: `Failed to parse JSON: ${error.message}` });
      }
    }
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
