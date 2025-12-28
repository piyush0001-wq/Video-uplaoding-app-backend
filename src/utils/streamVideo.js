import fs from "fs";

export default function streamVideo(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, { "Content-Length": stat.size });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const [start, end] = range.replace(/bytes=/, "").split("-");
  const chunkEnd = end ? parseInt(end) : stat.size - 1;

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${chunkEnd}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkEnd - start + 1,
    "Content-Type": "video/mp4"
  });

  fs.createReadStream(filePath, { start: +start, end: chunkEnd }).pipe(res);
}
