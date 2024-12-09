from streamlit_mui.core.elements import new_frame as _new_frame
from streamlit_mui.core.exceptions import *
from streamlit_mui.modules import *
from streamlit_mui.version import __version__


def elements(key: str) -> None:
    """Create a Streamlit Elements frame."""
    return _new_frame(key)

