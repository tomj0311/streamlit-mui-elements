import pandas as pd
import streamlit as st
from streamlit_mui_elements import mui, elements
import plotly.graph_objects as go

# Load data from CSV files if needed
# data = pd.read_csv('path_to_your_data.csv')

# Set the page configuration
st.set_page_config(layout="wide")

def earningcard():
    with mui.Card(
        sx={
            "backgroundColor": "primary.light",
            "color": "#fff",
            "overflow": "hidden",
            "position": "relative",
        }
    ):
        with mui.Box(sx={"p": 2.25}):
            with mui.Grid(container=True, direction="column"):
                # First row with avatars
                with mui.Grid(item=True):
                    with mui.Grid(container=True, justifyContent="space-between"):
                        with mui.Grid(item=True):
                            avatar = mui.Avatar("AA",
                                variant="rounded",
                                sx={
                                    "backgroundColor": "primary.900",
                                    "mt": 1,
                                    "width": 56,
                                    "height": 56,
                                },
                            )
                        with mui.Grid(item=True):
                            mui.Avatar(
                                variant="rounded",
                                sx={
                                    "backgroundColor": "secondary.dark",
                                    "color": "secondary.200",
                                    "zIndex": 1,
                                    "width": 40,
                                    "height": 40,
                                },
                                # Add onClick event handler if needed
                            )(mui.IconButton(mui.icon.MoreHoriz))
                # Second row with amount and icon
                with mui.Grid(item=True):
                    with mui.Grid(container=True, alignItems="center"):
                        mui.Typography(
                            "$500.00",
                            sx={
                                "fontSize": "2.125rem",
                                "fontWeight": 500,
                                "mr": 1,
                                "mt": 1.75,
                                "mb": 0.75,
                            },
                        )
                        mui.Avatar(
                            sx={
                                "backgroundColor": "secondary.100",
                                "width": 30,
                                "height": 30,
                            },
                        )(mui.icon.ArrowUpward(sx={"transform": "rotate(45deg)"}))
                # Third row with description
                with mui.Grid(item=True, sx={"mb": 1.25}):
                    mui.Typography(
                        "Total Earning",
                        sx={
                            "fontSize": "1rem",
                            "fontWeight": 500,
                        },
                    )

def popularcard():
    with mui.Card():
        with mui.CardContent():
            with mui.Grid(container=True, spacing=3):
                # Header section
                with mui.Grid(item=True, xs=12):
                    with mui.Grid(container=True, alignContent="center", justifyContent="space-between"):
                        with mui.Grid(item=True):
                            mui.Typography("Popular Stocks", variant="h4")
                        with mui.Grid(item=True):
                            with mui.IconButton(
                                sx={
                                    "color": "primary.200",
                                    "cursor": "pointer"
                                }
                            ):
                                mui.icon.MoreHoriz()

                # Chart section
                with mui.Grid(item=True, xs=12, sx={"pt": "16px !important"}):
                    # Note: You'll need to implement BajajAreaChartCard equivalent
                    pass

                # Stocks list section
                with mui.Grid(item=True, xs=12):
                    # Bajaj Finery
                    with mui.Grid(container=True, direction="column"):
                        with mui.Grid(item=True):
                            with mui.Grid(container=True, alignItems="center", justifyContent="space-between"):
                                with mui.Grid(item=True):
                                    mui.Typography("Bajaj Finery", variant="subtitle1")
                                with mui.Grid(item=True):
                                    with mui.Grid(container=True, alignItems="center", justifyContent="space-between"):
                                        with mui.Grid(item=True):
                                            mui.Typography("$1839.00", variant="subtitle1")
                                        with mui.Grid(item=True):
                                            with mui.Avatar(
                                                variant="rounded",
                                                sx={
                                                    "width": 16,
                                                    "height": 16,
                                                    "borderRadius": "5px",
                                                    "backgroundColor": "success.light",
                                                    "color": "success.dark",
                                                    "ml": 2
                                                }
                                            ):
                                                mui.icon.KeyboardArrowUp()
                        with mui.Grid(item=True):
                            mui.Typography("10% Profit", variant="subtitle2", sx={"color": "success.dark"})
                    
                    mui.Divider(sx={"my": 1.5})

                    # TTML
                    with mui.Grid(container=True, direction="column"):
                        # Similar structure for TTML stock...
                        pass

                    mui.Divider(sx={"my": 1.5})

                    # Reliance
                    with mui.Grid(container=True, direction="column"):
                        # Similar structure for Reliance stock...
                        pass

                    mui.Divider(sx={"my": 1.5})

                    # Additional stocks...

        with mui.CardActions(sx={"p": 1.25, "pt": 0, "justifyContent": "center"}):
            with mui.Button(size="small", disableElevation=True):
                mui.Typography("View All")
                mui.icon.ChevronRight()

def totalorderlinechartcard():
    # Create session state for time value if it doesn't exist
    if 'time_value' not in st.session_state:
        st.session_state.time_value = False

    with mui.Card:
        with mui.Box(sx={"p": 2.25}):
            with mui.Grid(container=True, direction="column", spacing=0):  # Changed from {xs: 0} to 0
                # First row with avatar and buttons
                with mui.Grid(item=True):  # Reduce margin bottom
                    with mui.Grid(container=True, justifyContent="space-between"):
                        # Avatar section
                        with mui.Grid(item=True):
                            with mui.Avatar(
                                variant="rounded",
                                sx={
                                    "backgroundColor": "primary.800",
                                    "color": "#fff",
                                    "mt": 0.4,
                                    "width": 56,
                                    "height": 56,
                                }
                            ):
                                mui.icon.LocalMallOutlined()
                        
                        # Time toggle buttons - removed onClick handlers
                        with mui.Grid(item=True):
                            mui.Button(
                                "Month",
                                variant="contained" if st.session_state.time_value else "text",
                                size="small",
                                sx={"color": "inherit"}
                            )
                            mui.Button(
                                "Year",
                                variant="contained" if not st.session_state.time_value else "text",
                                size="small",
                                sx={"color": "inherit"}
                            )

                # Second row with value and chart
                with mui.Grid(item=True):
                    with mui.Grid(container=True, alignItems="center", spacing=1):  # Changed from {xs: 1} to 1
                        # Left side - value and icon
                        with mui.Grid(item=True, xs=6):
                            with mui.Grid(container=True, alignItems="center"):
                                with mui.Grid(item=True):
                                    mui.Typography(
                                        "$108" if st.session_state.time_value else "$961",
                                        sx={
                                            "fontSize": "2.125rem",
                                            "fontWeight": 500,
                                            "mr": 1,
                                            "mt": 0.5,  # Reduce margin top
                                            "mb": 0.25  # Reduce margin bottom
                                        }
                                    )
                                with mui.Grid(item=True):
                                    with mui.Avatar(
                                        sx={
                                            "cursor": "pointer",
                                            "backgroundColor": "primary.200",
                                            "width": 30,
                                            "height": 30,
                                            "mt": 0  # Remove margin top
                                        }
                                    ):
                                        mui.icon.ArrowDownward(
                                            sx={"transform": "rotate3d(1, 1, 1, 45deg)"}
                                        )
                                with mui.Grid(item=True, xs=12):
                                    mui.Typography(
                                        "Total Order",
                                        sx={
                                            "fontSize": "1rem",
                                            "fontWeight": 500,
                                            "color": "primary.200",  # Add color
                                            "mt": 0  # Remove margin top
                                        }
                                    )
                        
                        # Right side - chart
                        with mui.Grid(item=True, xs=6):
                            mui.Box(
                                sx={
                                    "height": 55,  # Further reduce height
                                    "backgroundColor": "primary.800",
                                    "borderRadius": 1,
                                    "opacity": 0.5,
                                    "mt": 0.5  # Reduce margin top
                                }
                            )

def totalincomedarkcard():
    with mui.Card:
        with mui.Box(sx={"p": 1.25}):
            with mui.List(sx={"py": 0}):
                with mui.ListItem(alignItems="center", disableGutters=True, sx={"py": 0}):
                    with mui.ListItemAvatar():
                        with mui.Avatar(
                            variant="rounded",
                            sx={
                                "backgroundColor": "primary.800",
                                "color": "#fff"
                            }
                        ):
                            mui.icon.TableChartOutlined()
                    with mui.ListItemText(
                        sx={
                            "py": 0,
                        }
                    ):
                        mui.Typography("$203k", variant="h4", sx={"color": "#fff"})
                        mui.Typography(
                            "Total Income",
                            variant="subtitle2",
                            sx={"color": "primary.light", "mt": 0.25}
                        )

def totalincomelightcard():
    with mui.Card:
        with mui.Box(sx={"p": 1.25}):
            with mui.List(sx={"py": 0}):
                with mui.ListItem(alignItems="center", disableGutters=True, sx={"py": 0}):
                    with mui.ListItemAvatar():
                        with mui.Avatar(
                            variant="rounded",
                            sx={
                                "backgroundColor": "warning.light",
                                "color": "warning.dark"
                            }
                        ):
                            mui.icon.StorefrontTwoTone()
                    with mui.ListItemText(
                        sx={
                            "py": 0,
                            "mt": 0.45,
                            "mb": 0.45
                        }
                    ):
                        mui.Typography("$203k", variant="h4")
                        mui.Typography(
                            "Total Income",
                            variant="subtitle2",
                            sx={
                                "color": "grey.500",
                                "mt": 0.5
                            }
                        )

def totalgrowthbarchart():
    # If file doesn't exist, create sample data
    df = pd.DataFrame({
        'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        'current_year': [2100, 2300, 2500, 2200, 2800, 3000,
                        2900, 3200, 3100, 3400, 3600, 3800],
        'previous_year': [1800, 1900, 2100, 1950, 2300, 2500,
                        2400, 2600, 2800, 2900, 3100, 3300]
    })

    data = [
        {
            'type': 'bar',
            'name': 'Current Year',
            'x': df['month'].tolist(),
            'y': df['current_year'].tolist(),
            # Remove hardcoded colors - will be handled by theme
        },
        {
            'type': 'bar',
            'name': 'Previous Year',
            'x': df['month'].tolist(),
            'y': df['previous_year'].tolist(),
            # Remove hardcoded colors - will be handled by theme
        }
    ]
    
    layout = {
        'barmode': 'group',
        'margin': {'t': 20, 'r': 20, 'l': 40, 'b': 40},
        'height': 400,
        'xaxis': {
            'ticks': 'outside',
            'showgrid': False,  # Hide grid lines
        },
        'yaxis': {
            'ticks': 'outside',
            'showgrid': False,  # Hide grid lines
        },
    }

    with mui.Card(
        sx={
            "display": "flex",
            "flexDirection": "column",
            "borderRadius": 3,
            "overflow": "hidden",
        },
        elevation=1
    ):
        with mui.CardHeader(
            sx={"p": 2}
        ):
            with mui.Grid(container=True, alignItems="center", justifyContent="space-between"):
                with mui.Grid(item=True):
                    with mui.Grid(container=True, direction="column", spacing=1):
                        with mui.Grid(item=True):
                            mui.Typography("Total Growth", variant="h3")
                        with mui.Grid(item=True):
                            mui.Typography("$2,324.00", variant="h5")
                with mui.Grid(item=True):
                    with mui.TextField(
                        select=True,
                        defaultValue="today",
                        size="small"
                    ):
                        mui.MenuItem("Today", value="today")
                        mui.MenuItem("This Month", value="month")
                        mui.MenuItem("This Year", value="year")
        
        with mui.CardContent():
            mui.Plot(
                data=data,
                layout=layout,
            )

def dashboard():
    with elements("dashboard"):
        with mui.Grid(container=True, spacing=2):
            # First row
            with mui.Grid(item=True, xs=12):
                with mui.Grid(container=True, spacing=2):
                    with mui.Grid(item=True, lg=4, md=6, sm=6, xs=12):
                        earningcard()
                    with mui.Grid(item=True, lg=4, md=6, sm=6, xs=12):
                        totalorderlinechartcard()
                    with mui.Grid(item=True, lg=4, md=12, sm=12, xs=12):
                        with mui.Grid(container=True, spacing=2):
                            with mui.Grid(item=True, sm=6, xs=12, md=6, lg=12):
                                totalincomedarkcard()
                            with mui.Grid(item=True, sm=6, xs=12, md=6, lg=12):
                                totalincomelightcard()
            # Second row
            with mui.Grid(item=True, xs=12):
                with mui.Grid(container=True, spacing=2):
                    with mui.Grid(item=True, xs=12, md=8):
                        totalgrowthbarchart()
                    with mui.Grid(item=True, xs=12, md=4):
                        popularcard()

if __name__ == "__main__":
    dashboard()
