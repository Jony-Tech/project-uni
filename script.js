const elVideo = document.getElementById('video')

navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)

const cargarCamera = () => {
    navigator.getMedia({
        video: true,
        audio: false
    },
    stream => elVideo.srcObject = stream,
    console.error

    )
}
//cargar los modelos
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
]).then(cargarCamera)

elVideo.addEventListener('play', async() => {
    //creamos el canavas con los elementos del faceapi
    const canvas = faceapi.createCanvasFromMedia(elVideo)
    //Lo add al body
    // document.body.append(canvas)
    // let videoC = document.querySelector(".videoC")
    // videoC.appendChild(canvas)
    let canva = document.getElementById("canva");
    console.log(canva);
    canva.appendChild(canvas)

    //size del canvas
    const displaySize = {width: elVideo.width, height: elVideo.height};
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        //hacer las detecciones de cara 
        const detections = await faceapi.detectAllFaces(elVideo)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        .withFaceDescriptors()

        //poner en su sitio
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        //limpiar el canvas
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height) 

        //dibujar las lineas
        // faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

        resizedDetections.forEach(detection => {
            
            document.getElementById('genderInfo').textContent = detection.gender;
            document.getElementById('ageInfo').textContent = `${Math.round(detection.age)} years old`;
            document.getElementById('expressionInfo').textContent = printHtml(detection.expressions);
        },100);
        
    })
    function printHtml(expressions){
        let emotion = '';
        let valueEmotion = 0

        for(const e in expressions){
            if(expressions[e] > valueEmotion){
                valueEmotion = expressions[e];
                emotion = e;
            }
        }
        return `${Math.round(valueEmotion * 100)}% ${emotion}`
    }
})