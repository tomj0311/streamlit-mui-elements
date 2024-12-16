import json
from contextlib import contextmanager
import time
from streamlit import session_state, rerun

from streamlit_mui_elements.core.exceptions import ElementsFrameError
from streamlit_mui_elements.core.element import Element
from streamlit_mui_elements.core.render import render_component

ELEMENTS_FRAME_KEY = f"{__name__}.elements_frame"
RERUN_COOLDOWN = 0.1  # Minimum time between reruns in seconds
RERUN_EVENT_TYPES = {'file-change', 'filter-change', 'sort-change', 'pagination-change', 'selection-change'}

def should_rerun(event_type, event_key, timestamp):
    """Determine if app should rerun based on event type, timing, and prevent duplicate reruns"""
    print(f"Checking rerun for event type: {event_type}")  # Debug log
    if not event_type or event_type not in RERUN_EVENT_TYPES:
        print(f"Event type {event_type} not in {RERUN_EVENT_TYPES}")  # Debug log
        return False
        
    # Check if this event was already processed
    last_event = session_state.get('_last_processed_event', {})
    if (last_event.get('key') == event_key and 
        last_event.get('timestamp') == timestamp):
        return False
        
    last_rerun = session_state.get('_last_rerun_time', 0)
    current_time = time.time()
    should = current_time - last_rerun >= RERUN_COOLDOWN
    print(f"Should rerun based on cooldown: {should}")  # Debug log
    return should

def get_elements_frame():
    if ELEMENTS_FRAME_KEY not in session_state:
        raise ElementsFrameError("Frame was not created.")
    return session_state[ELEMENTS_FRAME_KEY]

@contextmanager
def new_frame(key):
    key = f"{ELEMENTS_FRAME_KEY}.{key}"
    frame = ElementsFrame(key)
    session_state[ELEMENTS_FRAME_KEY] = frame

    frame.capture_children()

    try:
        yield
        ui_tree = frame.to_dict()

        if ui_tree:
            ui_description = json.dumps(ui_tree)
            component = render_component(data=ui_description, key=key, default=None)

            if component is not None and component != 0:
                event_key = component.get('key')
                value = component.get('value')
                timestamp = component.get('timestamp')
                event_type = component.get('type')

                print(f"Received event: type={event_type}, key={event_key}")  # Debug log

                if event_key and event_key != 'undefined':
                    # Update event state
                    if "events" not in session_state:
                        session_state.events = {}
                    
                    if session_state.events.get(event_key, {}).get('timestamp') == timestamp:
                        print(f"Event {event_key} already processed")
                    else:
                        session_state.events[event_key] = {
                            "value": value,
                            "timestamp": timestamp,
                            "type": event_type
                        }

                    if should_rerun(event_type, event_key, timestamp):
                        # Store this event as the last processed one
                        session_state._last_processed_event = {
                            'key': event_key,
                            'timestamp': timestamp
                        }
                        print(f"Triggering rerun for event type: {event_type}")  # Debug log
                        session_state._last_rerun_time = time.time()
                        rerun()
    finally:
        if ELEMENTS_FRAME_KEY in session_state:
            del session_state[ELEMENTS_FRAME_KEY]

def new_element(module, element):
    if ELEMENTS_FRAME_KEY not in session_state:
        raise ElementsFrameError("Cannot create element outside a frame.")
    return Element(session_state[ELEMENTS_FRAME_KEY], module, element)


class ElementsFrame:
    __slots__ = ('_children', '_parents', '_key', '_is_saving')

    def __init__(self, key):
        self._children = []
        self._parents = []
        self._key = key
        self._is_saving = False

    def capture_children(self):
        # print(f"Start capturing children. Current children: {self._children}")  # Debugging
        self._parents.append(self._children)
        self._children = []
        # print(f"New context started. Parents stack: {self._parents}")  # Debugging

    def save_children(self, element):
        if self._is_saving:
            raise RuntimeError("Reentrant save_children call detected.")

        if not self._parents:
            raise RuntimeError("save_children called without active context.")

        self._is_saving = True
        captured_children = self._children
        self._children = self._parents.pop()

        # Only add non-prop children
        filtered_children = [
            child for child in captured_children 
            if not child._is_prop and not child._parent
        ]
        element(*filtered_children)

        if not element._is_prop and element not in self._children:
            self._children.append(element)

        captured_children.clear()
        self._is_saving = False

    def is_capturing_children(self):
        return len(self._parents) > 0

    def to_dict(self):
        result = [child.to_dict() for child in self._children]
        # print("UI Tree to_dict:", result)  # Debugging
        return result
