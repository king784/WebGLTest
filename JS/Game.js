var vertexShaderText = 
[
    "precision mediump float;",
    "",
    "attribute vec2 vertPosition;",
    "attribute vec3 vertColor;",
    "varying vec3 fragColor;",
    "",
    "void main()",
    "{",
    "   fragColor = vertColor;",
    "   gl_Position = vec4(vertPosition, 0.0, 1.0);",
    "}"

].join("\n");

var fragmentShaderText = 
[
    "precision mediump float;",
    "",
    "varying vec3 fragColor;",
    "void main()",
    "{",
    "   gl_FragColor = vec4(fragColor, 1.0);",
    "}"
].join("\n");

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

    // Create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    {
        console.error("Error compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
    {
        console.error("Error compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error("Error linking program! ", gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
    {
        console.error("Error validating program! ", gl.getProgramInfoLog(program));
        return;
    }
  
    // Create buffer
    var triangle = 
    [   // X,Y      R,G,B
        0.0, 0.5,   1.0, 1.0, 0.0,
        -0.5, -0.5, 0.6, 0.0, 1.0,
        0.5, -0.5,  0.1, 1.0, 0.6
    ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STATIC_DRAW);

    var positionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
    var colorAttributeLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
        positionAttributeLocation, // Attrib location
        2,  // Num of elements per attrib
        gl.FLOAT,   // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an indivitual vertex
        0 // Offset from the beginning of a single vertex to this attrib
    );
    gl.vertexAttribPointer(
        colorAttributeLocation, // Attrib location
        3,  // Num of elements per attrib
        gl.FLOAT,   // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an indivitual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attrib
    );

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);

    // main render loop
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
};