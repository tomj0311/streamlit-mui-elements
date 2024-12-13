import React from 'react';

export const createDataGridComponent = (module) => {
  return (props) => {
    const finalProps = {
      ...props,
      autoHeight: false,
      style: {
        height: props.height || 500,
        width: '100%',
      },
      sx: {
        ...props.sx,
        // Target all scrollbars in the DataGrid
        '& ::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '& ::-webkit-scrollbar-track': {
          background: (theme) => theme.palette.background.default,
        },
        '& ::-webkit-scrollbar-thumb': {
          background: (theme) => theme.palette.text.disabled,
          borderRadius: '3px',
          '&:hover': {
            background: (theme) => theme.palette.text.secondary,
          },
        },
        // Also target the specific virtualScroller scrollbars
        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
          background: (theme) => theme.palette.background.default,
        },
        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
          background: (theme) => theme.palette.text.disabled,
          borderRadius: '3px',
          '&:hover': {
            background: (theme) => theme.palette.text.secondary,
          },
        },
      }
    };
    return React.createElement(module.DataGrid, finalProps);
  };
};

export const dataGridComponents = {
  DataGrid: (dynamicImport) => dynamicImport(() => import("@mui/x-data-grid").then(module => ({ 
    default: createDataGridComponent(module)
  }))),
  GridActionsCellItem: (dynamicImport) => dynamicImport(() => import("@mui/x-data-grid").then(module => ({ default: module.GridActionsCellItem }))),
  GridToolbar: (dynamicImport) => dynamicImport(() => import("@mui/x-data-grid").then(module => ({ default: module.GridToolbar }))),
  GridToolbarColumnsButton: (dynamicImport) => dynamicImport(() => import("@mui/x-data-grid").then(module => ({ default: module.GridToolbarColumnsButton }))),
  GridToolbarContainer: (dynamicImport) => dynamicImport(() => import("@mui/x-data-grid").then(module => ({ default: module.GridToolbarContainer }))),
  GridToolbarDensitySelector: (dynamicImport) => dynamicImport(() => import("@mui/x-data-grid").then(module => ({ default: module.GridToolbarDensitySelector }))),
  GridToolbarExport: (dynamicImport) => dynamicImport(() => import("@mui/x-data-grid").then(module => ({ default: module.GridToolbarExport }))),
  GridToolbarFilterButton: (dynamicImport) => dynamicImport(() => import("@mui/x-data-grid").then(module => ({ default: module.GridToolbarFilterButton }))),
};
