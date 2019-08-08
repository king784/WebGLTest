var vertexShaderText = 
[
    "precision mediump float;",
    "",
    "attribute vec3 vertPosition;",
    "varying vec3 fragColor;",
    "uniform vec3 vertColor;",
    "uniform mat4 mWorld;",
    "uniform mat4 mView;",
    "uniform mat4 mProj;",
    "",
    "void main()",
    "{",
    "   fragColor = vertColor;",
    "   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
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

var moveX = 0.0;
var moveZ = 0.0;
var moveVec = [moveX, 0.0, moveZ];

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
    gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

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
    var boxVertices = 
	[ // X, Y, Z
		// Top
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// Left
		-1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0,
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,

		// Right
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,

		// Front
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,

		// Back
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,

		// Bottom
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, -1.0
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
    ];
    
    // Vertex buffer object
    var boxVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    // Index buffer object
    var boxIBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    var positionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(
        positionAttributeLocation, // Attrib location
        3,  // Num of elements per attrib
        gl.FLOAT,   // Type of elements
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT, // Size of an indivitual vertex
        0 // Offset from the beginning of a single vertex to this attrib
    );
    
    gl.enableVertexAttribArray(positionAttributeLocation);

    var boxColor = [0.6, 0.2, 0.2];
	var box2Color = [0.1, 0.7, 0.1];

    gl.useProgram(program);

    var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var matViewUniformLocation = gl.getUniformLocation(program, "mView");
    var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    var vertColorLocation = gl.getUniformLocation(program, "vertColor");

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -7], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    gl.uniform3fv(vertColorLocation, boxColor);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    // Camera
    var cameraPos = [0.0, 0.0, 3.0];
    var cameraTarget = [0.0, 0.0, 0.0];
    var cameraPosMTarget = [0.0, 0.0, 0.0];
    glMatrix.vec3.subtract(cameraPosMTarget, cameraPos, cameraTarget);
    var cameraDir = [0.0, 0.0, 0.0];
    glMatrix.vec3.normalize(cameraDir, cameraPosMTarget);

    var up = [0.0, 1.0, 0.0];
    var cameraRight = [0.0, 0.0, 0.0];
    var crossProductOfUpAndDir = [0.0, 0.0, 0.0];
    glMatrix.vec3.cross(crossProductOfUpAndDir, up, cameraDir);
    glMatrix.vec3.normalize(cameraRight, crossProductOfUpAndDir);
    
    var cameraUp = [0.0, 0.0, 0.0];
    glMatrix.vec3.cross(cameraUp, cameraDir, cameraRight);

    // main render loop
    var identityMatrix = new Float32Array(16);
	var moveMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function()
    {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle * 0.5, [1, 0, 0]);
        glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		
		gl.uniform3fv(vertColorLocation, box2Color);
        glMatrix.mat4.translate(worldMatrix, moveMatrix, moveVec);
        console.log(moveVec.toString());
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};

document.addEventListener('keydown', function(event) 
{
    if(event.keyCode == 65) 
	{
		moveX += 1.0;
		moveVec = [moveX, 0.0, moveZ];
		console.log(moveX);
    }
    else if(event.keyCode == 68) 
	{
        moveX -= 1.0;
		moveVec = [moveX, 0.0, moveZ];
		console.log(moveX);
    }
});