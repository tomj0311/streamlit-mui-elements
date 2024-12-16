import gc
import pandas as pd
import streamlit as st
from streamlit_mui_elements import mui, elements
import io

# Set the page configuration
st.set_page_config(layout="wide")

def create_data_grid(df: pd.DataFrame):
    # Add event tracking state
    if '__last_grid_event' not in st.session_state:
        st.session_state.__last_grid_event = None

    # Add filter state
    if '__grid_filter' not in st.session_state:
        st.session_state.__grid_filter = None
    if '__grid_page' not in st.session_state:
        st.session_state.__grid_page = 0
    if '__grid_page_size' not in st.session_state:
        st.session_state.__grid_page_size = 25
    if '__grid_sort_field' not in st.session_state:
        st.session_state.__grid_sort_field = None
    if '__grid_sort_dir' not in st.session_state:
        st.session_state.__grid_sort_dir = None

    # Create a copy of the dataframe to avoid modifying the original
    processed_df = df.copy()

    # Handle grid events with deduplication
    grid_event = st.session_state.get("events", {}).get("data-grid", {})
    if grid_event:
        current_event = (grid_event.get('type'), str(grid_event.get('value')))
        
        # Only process if event is different from last one
        if current_event != st.session_state.__last_grid_event:
            st.session_state.__last_grid_event = current_event
            
            if grid_event.get('type') == 'filter-change':
                filter_model = grid_event['value']
                st.session_state.__grid_filter = filter_model
                
                # Apply filtering
                if filter_model and filter_model.get('items'):
                    filtered_df = df.copy()
                    for filter_item in filter_model['items']:
                        field = filter_item.get('field')
                        operator = filter_item.get('operator')
                        value = filter_item.get('value')
                        
                        if field and operator == '=':
                            filtered_df = filtered_df[filtered_df[field] == value]
                    
                    st.session_state.__df = filtered_df
                    st.session_state.__grid_page = 0
                else:
                    st.session_state.__df = df.copy()
                    st.session_state.__grid_page = 0

            elif grid_event.get('type') == 'sort-change':
                sort_model = grid_event['value']
                if sort_model and len(sort_model) > 0:
                    st.session_state.__grid_sort_field = sort_model[0].get('field')
                    st.session_state.__grid_sort_dir = sort_model[0].get('sort')
                    # Apply sorting
                    if st.session_state.__grid_sort_field and st.session_state.__grid_sort_dir:
                        sorted_df = df.copy()
                        st.session_state.__df = sorted_df.sort_values(
                            by=st.session_state.__grid_sort_field,
                            ascending=(st.session_state.__grid_sort_dir == 'asc')
                        )
                        st.session_state.__grid_page = 0

            elif grid_event.get('type') == 'pagination-change':
                st.session_state.__grid_page = grid_event['value'].get('page', 0)
                st.session_state.__grid_page_size = grid_event['value'].get('pageSize', 25)

    # Apply pagination inside the pagination event
    row_count = 0
    start_idx = st.session_state.__grid_page * st.session_state.__grid_page_size
    end_idx = start_idx + st.session_state.__grid_page_size
    if '__df' in st.session_state:
        processed_df = st.session_state.__df.iloc[start_idx:end_idx]
        row_count = len(st.session_state.__df)
    else:
        processed_df = df.iloc[start_idx:end_idx]
        row_count = len(df)

    # Convert processed DataFrame to rows format
    rows = processed_df.to_dict('records')
    for i, row in enumerate(rows):
        row['id'] = i + start_idx

    # Create columns configuration with types
    columns = []
    for col in df.columns:
        column_def = {
            'field': col, 
            'headerName': col.title(), 
            'width': 100
        }
        
        # Set column type based on dtype
        if pd.api.types.is_numeric_dtype(df[col].dtype):
            column_def['type'] = 'number'
        elif pd.api.types.is_datetime64_any_dtype(df[col].dtype):
            column_def['type'] = 'dateTime'
        elif pd.api.types.is_bool_dtype(df[col].dtype):
            column_def['type'] = 'boolean'
            
        columns.append(column_def)

    if len(columns) > 2000:
        return mui.Typography(
            "Too many columns ",
            sx={"textAlign": "center"}
        )
    else:
        return mui.DataGrid(
            id="data-grid",
            rows=rows,
            columns=columns,
            checkboxSelection=True,
            paginationMode="server",
            sortingMode="server",
            filterMode="server",
            rowCount=row_count,
            pageSizeOptions=[5, 10, 25, 50],
            page=st.session_state.__grid_page,
            pageSize=st.session_state.__grid_page_size,
            initialState={
                "pagination": {
                    "paginationModel": {
                        "pageSize": st.session_state.__grid_page_size,
                        "page": st.session_state.__grid_page
                    }
                }
            }
        )

def datagrid():
    # Initialize main session state variables
    if 'df' not in st.session_state:
        st.session_state.df = None
    if 'last_processed_file' not in st.session_state:
        st.session_state.last_processed_file = None
    
    events = st.session_state.get("events", {})
    file_event = events.get("csv_upload", {})

    # Handle file upload
    if file_event:
        try:
            file_info = file_event.get('value', {})
            current_filename = file_info.get('name')
            # Only process if it's a new file and we haven't processed it already
            if (current_filename != st.session_state.last_processed_file and 
                not st.session_state.get('_file_processed')):
                file_content = file_info.get('result', None)

                if file_content:
                    import base64
                    content = base64.b64decode(file_content.split(',')[1])
                    
                    # Clear previous dataframe first
                    st.session_state.df = None
                    gc.collect()
                    
                    # Load new dataframe
                    st.session_state.df = pd.read_csv(io.BytesIO(content))
                    st.session_state.last_processed_file = current_filename

                    # Clean up
                    del content
                    gc.collect()
                
        except Exception as e:
            st.error(f"Error reading file: {str(e)}")
            if '_file_processed' in st.session_state:
                del st.session_state._file_processed

    with elements("datagrid"):
        with mui.Card(sx={"p": 2}):
            with mui.CardHeader(
                title=mui.Typography("Data Grid", variant="h4"),
                action=mui.Button(
                    "Upload CSV",
                    variant="contained",
                    startIcon=mui.icon.Upload(),
                    component="label",
                    sx={"mt": 1}
                )(
                    mui.Input(
                        type="file",
                        id="csv_upload",
                        inputProps={
                            "accept": ".csv",
                            "multiple": False,
                        },
                        sx={"display": "none"},
                        disableUnderline=True,
                    )
                ),
                sx={"pb": 0}
            ):
                pass

            with mui.CardContent(sx={"pt": 2}):
                mui.TextField(
                    id="search-field",
                    label="Search",
                    variant="outlined",
                    fullWidth=True,
                    sx={"mb": 2},  # Add margin bottom for spacing

                )
                # Display DataGrid if data is available
                if st.session_state.last_processed_file is not None:
                    with mui.Box:
                        mui.Typography(
                            f"File uploaded successfully {len(st.session_state.df)} rows",
                            sx={"textAlign": "center"}
                        )
                        # create_data_grid(st.session_state.df)
                else:
                    mui.Typography(
                        "Upload a CSV file to display data",
                        sx={"textAlign": "center"}
                    )

    if st.session_state.get("events"):
        st.write(st.session_state["events"])

if __name__ == "__main__":
    datagrid()
