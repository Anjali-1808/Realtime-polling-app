function setupSocket(io, prisma) {
io.on('connection', (socket) => {
console.log('socket connected', socket.id);


// join a poll room: client should emit { pollId }
socket.on('joinPoll', ({ pollId }) => {
if (!pollId) return;
socket.join(`poll_${pollId}`);
console.log(`socket ${socket.id} joined poll_${pollId}`);
});


socket.on('leavePoll', ({ pollId }) => {
if (!pollId) return;
socket.leave(`poll_${pollId}`);
});


socket.on('disconnect', () => {
console.log('socket disconnected', socket.id);
});
});
}


module.exports = { setupSocket };