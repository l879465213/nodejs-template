let io;
const init = (_io) => (io = _io) && listen();

const listen = () => {
  io.on("connection", (socket) => {
    socket.on("in", function (id) {
      if (id) {
        socket.join(id.toString());
      }
    });
    socket.on("disconnect", function () {
      var rooms = io.sockets.adapter.sids[socket.id];
      for (var room in rooms) {
        socket.leave(room);
      }
    });
  });
};


module.exports = { updateLocation, init };
