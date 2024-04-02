
import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import style from "./style/perTaskStyle.module.css";

const theme = createTheme({
  palette: {
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    primary: {
      contrastThreshold: 4.5,
      main: "#ffffff",
    },

    text: { primary: "#ffffff", secondary: "#ffffff" },
  },
});

const marks = [
  {
    value: 0,
    label: "100",
  },
  {
    value: 25,
    label: "50",
  },
  {
    value: 50,
    label: "0",
  },
  {
    value: 75,
    label: "50",
  },
  {
    value: 100,
    label: "100",
  },
];

export function BlameSliderGlobal({ callBackValue, initialValue }) {
  const [value, setValue] = React.useState(initialValue);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    //  console.log(newValue);
    callBackValue(newValue);
  };

  return (
    <Box sx={{ width: 600 }}>
      <Box sx={{ width: 500 }}>
        <ThemeProvider theme={theme}>
          <Slider
            color="primary"
            aria-label="Always visible"
            step={1}
            marks={marks}
            min={0}
            max={100}
            track={false}
            valueLabelDisplay="on"
            value={value}
            onChange={handleChange}
          />
        </ThemeProvider>
      </Box>
      <span className={style.confTextLeft}>I performed better</span>
      <span className={style.confTextMiddle}>We performed equally</span>
      <span className={style.confTextRight}>Player Z performed better</span>
    </Box>
  );
}
