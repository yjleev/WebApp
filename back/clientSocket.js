const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    ws.on("message", (response) => {
      let obj = JSON.parse(response.toString("UTF-8"));
      let { type, question } = obj;

      if (type === "send_msg") {
        const botws = new WebSocket("ws://127.0.0.1:5000/ws");

        botws.on("open", () => {
          botws.send(JSON.stringify({ type: "chat", message: question }));
        });

        botws.on("message", (data) => {
          const response = data.toString("utf-8");
          ws.send(JSON.stringify({ type: "response", message: response }));
        });

        botws.on("error", (err) => {
          console.error(err);
        });

        botws.on("close", () => {
          console.log(`closed FastAPI websocket`);
        });
      }
    });
  });
};