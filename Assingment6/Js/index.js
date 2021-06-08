//function that displaying  value
function display(val) {
    document.getElementById("result").value += val;
}
//function that evaluates the digit and return result
function result() {
    let resultVal = document.getElementById("result").value;
    let output = eval(resultVal);
    document.getElementById("result").value = output;
}
//function that clear the displayplayplay
function clr() {
    document.getElementById("result").value = "";
}