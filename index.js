const fs = require('fs');
const { pipeline } = require('stream')
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.get('/video/:videoName', (req, res) => {
    const videoName = req.params.videoName;
    const range = req.headers.range;

    if (!range) {
        res.status(400).send("Requires range header.")
    }

    const videoPath = `${videoName}`;
    const videoSize = fs.statSync(`${videoName}`).size

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": `bytes`,
        "Content-Length": contentLength,
        "Content-Type": `video/mp4`,
    }

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, { start, end });

    pipeline(videoStream, res, err => {
        if (err) console.log(err)
    })


})

app.listen(8000, () => {
    console.log(`Listening to port 8000 !!`)
});