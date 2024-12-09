from streamlit_mui import mui, elements
import streamlit as st

with elements("key2"):
    with mui.Card(
        sx={
            "display": "flex",
            "flexDirection": "column",
            "borderRadius": 3,
            "overflow": "hidden",
            "marginTop": "30px"
        },
        elevation=1
    ):
        # Remove any standalone calls to mui.Avatar or mui.IconButton here!
        
        mui.CardHeader(
            title="Shrimp and Chorizo Paella",
            subheader="September 14, 2016",
            avatar=mui.Avatar("R", sx={"bgcolor": "red"}),
            action=mui.IconButton(mui.icon.MoreVert),
        )

        mui.CardMedia(
            component="img",
            height=194,
            image="https://mui.com/static/images/cards/paella.jpg",
            alt="Paella dish",
        )

        with mui.CardContent(sx={"flex": 1}):
            mui.Typography(
                "This impressive paella is a perfect party dish and a fun meal to cook together "
                "with your guests. Add 1 cup of frozen peas along with the mussels, if you like."
            )
