import React from "react";
import ReactDOM from "react-dom";
import App from "../src/components/App";

const name = "Ayush";
const element = ( <
    h1 > { " " }
    Hello, { name } { " " } <
    /h1>
);
ReactDOM.render( <
    div class = { "first" }
    style = {
        { backgroundColor: "blue", border: "2px solid black" } } >
    { " " } { element } < App / >
    <
    /div>,
    document.getElementById("root")
);