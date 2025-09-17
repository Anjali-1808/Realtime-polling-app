const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const prisma = require('./prismaClient');
const { setupSocket } = require('./socket');


const usersRouter = require('./routes/users');
const pollsRouterFactory = require('./routes/polls');


const app = express();
app.use(cors());
app.use(express.json());


app.use('/users', usersRouter);
// pollsRouter needs access to io to emit events when votes are cast


const server = http.createServer(app);
const io = new Server(server, {
cors: { origin: '*' }
});


// wire sockets
setupSocket(io, prisma);


// mount polls router with io
app.use('/polls', pollsRouterFactory(io));


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
console.log(`Server listening on ${PORT}`);
});