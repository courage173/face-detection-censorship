require("babel-core/register");
require("babel-polyfill");

const video = document.querySelector('.webcam')
const canvas = document.querySelector('.video')
const ctx = canvas.getContext('2d');
const faceCanvas = document.querySelector('.face')
const faceCtx = faceCanvas.getContext('2d')
const controls = document.querySelectorAll('.controls input[type = "range"]')

controls.forEach(item => item.addEventListener('input', (event) => {
    return options[event.currentTarget.name] = parseFloat(event.currentTarget.value)
}))

const faceDetector = new FaceDetector()

const options = {
    SIZE: 10,
    SCALE: 1.35
}

async function populateVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 900, height: 500 },
    })
    video.srcObject = stream
    await video.play()
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    faceCanvas.width = video.videoWidth
    faceCanvas.height = video.videoHeight
}

async function detect() {
    const faces = await faceDetector.detect(video)
    faces.forEach(drawFace)
    faces.forEach(censor)
    requestAnimationFrame(detect)
}
function drawFace(face) {
    const { width, height, top, left } = face.boundingBox;
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#ffc600'
    ctx.lineWidth = 2
    ctx.strokeRect(left, top, width, height)
}

function censor({ boundingBox: face }) {
    faceCtx.imageSmoothingEnabled = false
    faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height)
    faceCtx.drawImage(
        video,
        face.x,
        face.y,
        face.width,
        face.height,
        face.x,
        face.y,
        options.SIZE,
        options.SIZE
    )
    const width = face.width * options.SCALE;
    const height = face.height * options.SCALE
    faceCtx.drawImage(
        faceCanvas,
        face.x,
        face.y,
        options.SIZE,
        options.SIZE,
        face.x - (width - face.width) / 2,
        face.y - (height - face.height) / 2,
        width,
        height
    )
}

populateVideo().then(detect)


