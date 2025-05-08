import WebSocket from "ws";
import readline from "readline";
import chalk from "chalk";

const client = new WebSocket("ws://localhost:8080");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

client.on("message", (message) => {
  const texto = message.toString();
  if (texto.startsWith("[Servidor]")) {
    console.log(chalk.magenta(texto));
  } else {
    console.log(chalk.cyan(texto));
  }
});

client.on("open", () => {
  console.log(chalk.green("Conectado al servidor WebSocket."));
  rl.question("Ingrese su nombre de usuario: ", (username) => {
    client.send(username);
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

client.on("close", () => {
  console.log(chalk.gray("Conexión cerrada."));
  rl.close();
});
