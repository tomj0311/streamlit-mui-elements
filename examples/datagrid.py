import gc
import pandas as pd
import streamlit as st
from streamlit_mui_elements import mui, elements, data_grid
from streamlit_mui_elements.modules.file_upload import file_upload, handle_upload
import io

def datagrid():
    # Initialize main session state variables
    if 'df' not in st.session_state:
        st.session_state.df = None
    
    with elements("datagrid"):
        with mui.Card(sx={"p": 2}):
            with mui.CardHeader(
                title=mui.Typography("Data Grid", variant="h5"),
                action=file_upload(key="csv_upload"),  # Create upload button
                sx={"pb": 0}
            ):
                # Handle file upload separately
                df, filename = handle_upload(key="csv_upload")  # Changed this line
                st.session_state.df = df
                gc.collect()

            with mui.CardContent(sx={"pt": 2}):
                # Display DataGrid if data is available
                if st.session_state.df is not None:
                    with mui.Box:
                        data_grid(st.session_state.df)
                        mui.Typography(
                            f"File uploaded successfully {len(st.session_state.df)} rows",
                            sx={"textAlign": "center", "mt": 2}
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
