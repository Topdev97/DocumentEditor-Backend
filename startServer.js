const express = require('express');
const http = require('http');
require('./src/config/mongooseConfig')
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Document = require('./src/model/document')
const routes = require('./src/routes'); // Replace with actual path to routes

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'], // Add client origin
  },
});
const defaultValue = {}

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(routes);

app.get('/status', (req, res) => res.status(200).send('OK'));

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('get-document', async (documentId) => {
    console.log("kkkkkkkk")
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      console.log("sfdsfd")
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      console.log("--------", data)
      await Document.findByIdAndUpdate(documentId, { data })
    })
  });

  async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
  }

  // socket.on("save-document", async data => {
  //   console.log("==========", data);
  // })
  
  // socket.on('disconnect', () => {
  //   console.log('Client disconnected:', socket.id);
  // });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
