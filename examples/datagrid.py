import pandas as pd
import streamlit as st
from streamlit_mui_elements import mui, elements
import io

# Set the page configuration
st.set_page_config(layout="wide")

def datagrid():
    # State management for uploaded data
    if 'df' not in st.session_state:
        st.session_state.df = None

    # Get events from session state
    events = st.session_state.get("events", {})
    file_event = events.get("csv_upload", {})

    # Handle file upload event
    if file_event:
        try:
            # Get the file content from the event
            file_content = file_event.get('value', {}).get('result', None)
            if file_content:
                # Convert base64 to bytes and create DataFrame
                import base64
                content = base64.b64decode(file_content.split(',')[1])
                df = pd.read_csv(io.BytesIO(content))
                st.session_state.df = df
        except Exception as e:
            st.error(f"Error reading file: {str(e)}")

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
                # Display DataGrid if data is available
                if st.session_state.df is not None:
                    df = st.session_state.df
                    
                    # Convert DataFrame to rows format
                    rows = df.to_dict('records')
                    for i, row in enumerate(rows):
                        row['id'] = i

                    # Create columns configuration with types
                    columns = [
                        {'field': 'id', 'headerName': 'ID', 'width': 50, 'type': 'number'},
                    ]
                    
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

                    with mui.Box:
                        mui.DataGrid(
                            id="data-grid",
                            rows=rows,
                            columns=columns,
                            checkboxSelection=True,
                            disableSelectionOnClick=True
                        )
                else:
                    mui.Typography(
                        "Upload a CSV file to display data",
                        sx={"textAlign": "center"}
                    )

    if st.session_state.get("events"):
        st.write(st.session_state["events"])

if __name__ == "__main__":
    datagrid()
