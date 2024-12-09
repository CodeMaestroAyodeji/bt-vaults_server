// socket.js
let io;

const setIo = (socketIo) => {
    io = socketIo;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized. Please call setIo() first.');
    }
    return io;
};

module.exports = { setIo, getIo };
