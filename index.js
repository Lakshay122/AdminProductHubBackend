const http = require("http");
const app = require("./app");
const connectDatabase = require("./connectDatabase");

const server = http.createServer(app);

const port = process.env.PORT || 8082;
connectDatabase();

server.listen(port, () => {
  console.log(`Listening on ${port}`);
});
