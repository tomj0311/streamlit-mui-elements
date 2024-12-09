import React, { useEffect, useState } from "react";
import { withStreamlitConnection, Streamlit } from "streamlit-component-lib";
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function HelloTom({ args }) {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  useEffect(() => {
    Streamlit.setFrameHeight();
  });

  const handleSubmit = () => {
    Streamlit.setComponentValue({ input1, input2 });
  };

  return (
    <div>
      <Typography variant="h1" component="h2" style={{ fontWeight: 'bold' }}>
        Hello Tom Jose!
      </Typography>
      <TextField
        label="Input 1"
        value={input1}
        onChange={(e) => setInput1(e.target.value)}
        style={{ margin: '10px 0' }}
      />
      <TextField
        label="Input 2"
        value={input2}
        onChange={(e) => setInput2(e.target.value)}
        style={{ margin: '10px 0' }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
}

export default withStreamlitConnection(HelloTom);