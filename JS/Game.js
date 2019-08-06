var InitDemo = function()
{
    var canvas = document.getElementById("GameCanvas");
    var gl = canvas.getContext("webgl");

    if(!gl)
    {
        console.log("WebGL not supported! Using fallback, experimental WebGL.");
        gl = canvas.getContext("experimental-webgl");
    }

    if(!gl)
    {
        alert("Your browser doesn't support WebGL!");
    }

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};