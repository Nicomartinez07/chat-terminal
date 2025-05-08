import { WebSocketServer } from "ws";
import readline from "readline";
import chalk from "chalk";

const server = new WebSocketServer({ port: 8080 });
const clients = new Map();

console.log(chalk.green("Servidor WebSocket ejecutándose en ws://localhost:8080"));

server.on("connection", (socket) => {
  console.log(chalk.gray("Cliente conectado. Esperando nombre de usuario..."));

  let usernameSet = false;

  socket.on("message", (message) => {
    if (!usernameSet) {
      const username = message.toString().trim();
      clients.set(socket, username);
      usernameSet = true;

      console.log(chalk.blue(`Usuario conectado: ${username}`));
      broadcast(chalk.magenta(`[Servidor]: El usuario "${username}" se ha unido al chat.`), socket);
      return;
    }

    const username = clients.get(socket);
    const formatted = chalk.cyan(`${username}: ${message}`);
    console.log(formatted);
    broadcast(formatted, socket);
  });

  socket.on("close", () => {
    const username = clients.get(socket);
    clients.delete(socket);
    if (username) {
      console.log(chalk.red(`Usuario desconectado: ${username}`));
      broadcast(chalk.magenta(`[Servidor]: El usuario "${username}" ha salido del chat.`));
    }
  });
});

function broadcast(message, excludeSocket = null) {
  for (const [client] of clients) {
    if (client.readyState === client.OPEN && client !== excludeSocket) {
      client.send(message);
    }
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.on("line", (input) => {
  const mensaje = chalk.magenta(`[Servidor]: ${input}`);
  console.log(mensaje);
  broadcast(mensaje);
});
