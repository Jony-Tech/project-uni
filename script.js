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
    let videoC = document.querySelector(".videoC")
    videoC.appendChild(canvas)

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
            // const box = detection.detection.box;
            const ageInfo = Math.round(detection.age) + ' years ' + detection.gender;
            const expressionInfo =printHtml(detection.expressions);

            
            

            // new faceapi.draw.DrawBox (box, {
            //     label: Math.round(detection.age) + ' años ' + detection.gender
            // }).draw(canvas)

            document.getElementById('ageInfo').textContent = ageInfo;
            document.getElementById('expressionInfo').textContent = expressionInfo;
        },100);
        
    })
    function getExpresionesInfo(expresiones) {
    // Convierte el objeto de expresiones en una cadena legible
    const expresionesArray = Object.entries(expresiones).map(([expresion, probabilidad]) => {
        return `${expresion}: ${Math.round(probabilidad * 100)}`;
    });

    // Combina las expresiones en una cadena
    return expresionesArray.join(', ');
    }
    function printHtml(expressions){
        let emotion = '';
        let valueEmotion = 0

        for(const e in expressions){
            if(expressions[e] > valueEmotion){
                valueEmotion = expressions[e];
                emotion = e;
            }
        }
        return `${emotion} : ${valueEmotion}`
    }
})
//neutral: 96%, happy: 2%, sad: 0%, angry: 1%, fearful: 0%, disgusted: 0%, surprised: 0%