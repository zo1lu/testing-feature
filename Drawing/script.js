const canvas = document.getElementById("canvas")
let mousedown, mouseup
let drawMode
let brushWidth = 5;
let brushColor = "#ff0000"
let startX, startY, snapshot
let polyStart = false
let prevX, prevY
ctx = canvas.getContext("2d",{ willReadFrequently: true });
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

function drawing(e){
    if(mousedown){
        ctx.putImageData(snapshot, 0, 0);
    }
    if(mousedown && drawMode === "draw"){
        let x = parseInt(e.offsetX)
        let y = parseInt(e.offsetY)
        ctx.lineTo(x, y);
        ctx.stroke();
    }else if(mousedown && drawMode === "square"){
        ctx.strokeRect(e.offsetX, e.offsetY, startX - e.offsetX, startY - e.offsetY)
    }else if(mousedown && drawMode === "circle"){
        ctx.beginPath();
        ctx.arc(startX, startY, getDistance(startX,startY,e.offsetX,e.offsetY), 0, 2*Math.PI);
        ctx.stroke();
    }
}

function getDistance(point1X, point1Y, point2X, point2Y){
    return Math.sqrt((point1X - point2X)**2 + (point1Y - point2Y)**2) 
}

canvas.addEventListener("mousedown",(e)=>{
    mousedown = true;
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = brushColor;
    ctx.beginPath();
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
    startX = e.offsetX;
    startY = e.offsetY;
})
canvas.addEventListener("mouseup",(e)=>{
    if(mousedown && drawMode ==="polyline"){
        ctx.putImageData(snapshot, 0, 0);
        !polyStart?ctx.moveTo(startX, startY):ctx.moveTo(prevX, prevY)
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        prevX = e.offsetX
        prevY = e.offsetY
        polyStart = true
    }
    mousedown = false
})
canvas.addEventListener("mousemove", drawing)

const drawPolyline = (e)=>{
    ctx.moveTo(startX, startY);
    let x = parseInt(e.offsetX);
    let y = parseInt(e.offsetY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

const clearCanvas = ()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
}

const saveCanvas = () =>{
    const link = document.createElement("a")
    link.download = `${Date.now()}.jpg`
    link.href = canvas.toDataURL();
    link.click();
}

const setCanvasBackground = ()=>{
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = brushColor;
    // let image = new Image();
    // image.src = "./public/images/powerpuff.jpg"
    // let image02 = new Image();
    // image02.src = "./public/images/1696751613718.jpg"
    // let image03 = new Image();
    // image03.src = "./public/images/1696751712699.jpg"
    // image.onload = function(){
    //     ctx.drawImage(image, 0, 0, canvas.width/2, canvas.height/2);
    // }
    // image02.onload = function(){
    //     ctx.drawImage(image02, 100, 150, canvas.width/2, canvas.height/2);
    // }
    // image03.onload = function(){
    //     ctx.drawImage(image03, 200, 500, canvas.width/2, canvas.height/2);
    // }
}


const resetDrawBtn = () =>{
    document.getElementById("draw").style.border = "none";
    document.getElementById("circle").style.border = "none";
    document.getElementById("polyline").style.border = "none";
    document.getElementById("square").style.border = "none";
}

const draw = ()=>{
    resetDrawBtn();
    drawMode = "draw";
    document.getElementById("draw").style.border = "solid 1px black";
}
const circle =()=>{
    resetDrawBtn();
    drawMode = "circle";
    document.getElementById("circle").style.border = "solid 1px black";
}
const polyline =()=>{
    resetDrawBtn();
    drawMode = "polyline";
    document.getElementById("polyline").style.border = "solid 1px black";
}
const square =()=>{
    resetDrawBtn();
    drawMode = "square";
    document.getElementById("square").style.border = "solid 1px black";
}

const setBrushWidth = ()=>{
    brushWidth = document.getElementById("brush_width").value;
}
const setBrushColor = ()=>{
    brushColor = document.getElementById("brush_color").value;
}

setCanvasBackground();

//////////////////////////////////////////////////////////////////////////////
//Polyline feature
//close polyline
//draw with preview

//scale image size by mouse scale
// const scaleImage = () =>{
// }