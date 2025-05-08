import { WebSocketServer } from "ws";
import readline from "readline";

const server = new WebSocketServer({ port: 8080 });
const clients = new Map(); // socket => username

console.log("Servidor WebSocket ejecutándose en ws://localhost:8080");

// Nueva conexión
server.on("connection", (socket) => {
  console.log("Cliente conectado. Esperando nombre de usuario...");

  let usernameSet = false;

  socket.on("message", (message) => {
    if (!usernameSet) {
      const username = message.toString().trim();
      clients.set(socket, username);
      usernameSet = true;

      console.log(`Usuario conectado: ${username}`);

      // Notificar a todos
      broadcast(`[Servidor]: El usuario "${username}" se ha unido al chat.`, socket);
      return;
    }

    const username = clients.get(socket);
    const mensaje = `${username}: ${message}`;
    console.log(mensaje);

    broadcast(mensaje, socket); // A todos menos al remitente
  });

  socket.on("close", () => {
    const username = clients.get(socket);
    clients.delete(socket);
    if (username) {
      console.log(`Usuario desconectado: ${username}`);
      broadcast(`[Servidor]: El usuario "${username}" ha salido del chat.`);
    }
  });
});

// Función para enviar a todos (opcionalmente excluyendo a uno)
function broadcast(message, excludeSocket = null) {
  for (const [client, _] of clients) {
    if (client.readyState === client.OPEN && client !== excludeSocket) {
      client.send(message);
    }
  }
}

// Entrada por consola del servidor
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  const mensaje = `[Servidor]: ${input}`;
  console.log(`(tú): ${mensaje}`);
  broadcast(mensaje);
});
