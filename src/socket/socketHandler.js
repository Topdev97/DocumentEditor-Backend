// src/socket/socketHandler.js
const Document = require('../model/document');

const defaultValue = "";

async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("get-document", async (documentId) => {
      try {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document", document.data);

        socket.on("send-changes", (delta) => {
          socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        socket.on("save-document", async (data) => {
          await Document.findByIdAndUpdate(documentId, { data });
        });
      } catch (error) {
        console.error("Error handling get-document:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
