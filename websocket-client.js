import WebSocket from "ws";
import readline from "readline";

// Conectar al servidor WebSocket
const client = new WebSocket("ws://localhost:8080");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let usernameSet = false;

// Escuchar mensajes del servidor
client.on("message", (message) => {
  console.log(`${message}`);
});

// Al conectarse, pedir nombre de usuario
client.on("open", () => {
  console.log("Conectado al servidor WebSocket.");
  rl.question("Ingrese su nombre de usuario: ", (username) => {
    client.send(username); // Enviar nombre al servidor
    usernameSet = true;

    // Escuchar entrada de línea por consola
    rl.on("line", (input) => {
      if (input.trim().toLowerCase() === "/salir") {
        client.close();
        rl.close();
        return;
      }
      client.send(input);
    });
  });
});

// Manejar cierre de conexión
client.on("close", () => {
  console.log("Conexión cerrada.");
  rl.close();
});
