const Server = require('express');
const app = require('./App');

const server = Server();
server.use('/api/v1', app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, 'localhost', () => {
  console.log(`App running on PORT ${PORT}.`);
});
