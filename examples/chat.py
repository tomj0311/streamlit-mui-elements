import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
from streamlit_mui_elements import mui, elements
# from llm import get_completion
from datetime import datetime

from streamlit_mui_elements.core.events import event_store

def chat_input(value=""):
    with mui.Box(sx={"mt": 2}):
        mui.TextField(
            id="chat_input",
            label="Type a message",
            variant="outlined",
            fullWidth=True,
            multiline=True,
            rows=3,
            type="submit",
            InputProps={
                "endAdornment": (
                    mui.IconButton(
                        mui.icon.Send,
                        color="primary",
                        edge="end",
                    )
                )
            }
        )

def chat_message(message):
    if message:
        sender, content, timestamp = message
        is_assistant = sender == "Assistant"
        alignment = "flex-end" if is_assistant else "flex-start"
        with mui.Box(sx={"p": 1, "display": "flex", "justifyContent": alignment}):
            with mui.Grid(container=True, spacing=2, sx={"maxWidth": "80%"}):
                with mui.Grid(item=True, xs=1.5, sx={"order": 2 if is_assistant else 1}):
                    mui.Avatar(sender[0], sx={"backgroundColor": "primary.main"})
                with mui.Grid(item=True, xs=10.5, sx={"order": 1 if is_assistant else 2}):
                    mui.Typography(sender, variant="subtitle2", sx={"color": "primary.main"})
                    mui.Typography(content, variant="body2")
                    mui.Typography(timestamp, variant="caption", sx={"color": "grey.500"})

def chat(key="key1"):
    with elements(key):
        mui.Typography("Test Application", variant="h4", sx={"mb": 2})
                     
if __name__ == "__main__":
    print(event_store)
    chat_input_events = event_store.get("chat_input", {})

    # Initialize last processed timestamp if not exists
    if "last_processed_time" not in st.session_state:
        st.session_state.last_processed_time = 0

    # Get current event timestamps
    input_timestamp = chat_input_events.get('timestamp', 0) if chat_input_events else 0
    current_event_time = input_timestamp

    # Initialize chat messages list if it doesn't exist
    if "chat_messages" not in st.session_state:
        st.session_state.chat_messages = []

    # Only process if this is a new event
    if current_event_time > st.session_state.last_processed_time:
        # Handle text input events
        if chat_input_events:
            if chat_input_events.get('type') == "blur":
                st.session_state.prompt = chat_input_events.get('value')
                if st.session_state.prompt:
                    st.session_state.new_message = ("User", st.session_state.prompt, datetime.now().strftime("%I:%M %p"))                    
                    st.session_state.chat_messages.append(st.session_state.new_message)

            if chat_input_events.get('type') == "click" and chat_input_events.get('value') == None:
                current_time = datetime.now().strftime("%I:%M:%S %p")
                response = f"How can I assist you today? {current_time}"
                chat_response = ("Assistant", response, current_time)
                st.session_state.chat_messages.append(chat_response)

                chat()

        # Update the last processed timestamp
        st.session_state.last_processed_time = current_event_time


    # Chat input section
    with elements("chat_input"):
        with mui.Grid(container=True, spacing=2):
            with mui.Grid(item=True, xs=12):
                mui.Typography("Chat Application", variant="h4", sx={"mb": 2})
            with mui.Grid(item=True, xs=12):
                with mui.Card(sx={
                    "p": 2, 
                    "overflowY": "auto", 
                    "borderRadius": 1,
                    "&::-webkit-scrollbar": {
                        "width": "6px"
                    },
                    "&::-webkit-scrollbar-track": {
                        "background": "#f1f1f1",
                        "borderRadius": "4px"
                    },
                    "&::-webkit-scrollbar-thumb": {
                        "background": "#888",
                        "borderRadius": "4px"
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        "background": "#555"
                    }
                }):
                    # Display all messages in a single loop
                    for msg in st.session_state.chat_messages:
                        chat_message(msg)
         
            with mui.Grid(item=True, xs=12):
                chat_input()


