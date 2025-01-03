from pathlib import Path
from streamlit.components.v1 import declare_component
from streamlit_mui_elements import version

if version.__release__:
    ELEMENTS_FRONTEND = {"path": (Path(version.__file__).parent/"frontend/build").resolve()}
else:
    # In development mode, use only url for local development server
    ELEMENTS_FRONTEND = {
        "url": "http://localhost:3001"
    }

render_component = declare_component(
    "streamlit_elements",
    **ELEMENTS_FRONTEND
)

