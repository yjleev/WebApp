const WebSocket = require("ws");

let sockets = []; // 연결된 소켓을 담을 배열
let answer, parseString = "";

module.exports = (server) => {
  const wss = new WebSocket.Server({ server }); // express와 포트 공유

  /**
   * 'connection' / onopen => 커넥션이 맺어졌을 때 발생하는 이벤트
   * 'message' / onmessage => 데이터를 수신했을 때 발생하는 이벤트
   * 'error' / onerror => 에러가 생겼을 때 발생하는 이벤트
   * 'close' / onclose => 커넥션이 종료되었을 때 발생하는 이벤트
   */

  wss.on("connection", (ws, req) => {
    // ws => 연결된 클라이언트에 대한 정보
    // req => 처음 커넥션을 맺었을 때의 요청헤더 정보
    console.log(req.connection.remoteAddress);

    ws.id = req.headers["sec-websocket-key"];
    // sec-websocket-key를 통해 웹소켓 식별
    ws.answer = "";

    sockets.push(ws);

    ws.on("close", (code, reason) => {
      // code => 연결이 종료되는 이유를 가르키는 숫자(기본값: 1000)
      // reason => 왜 종료되는지 사람이 읽을 수 있도록 나타내는 문자열

      const message = reason.toString() || "No reason provided";
      console.log(`${message} 방을 나감`);

      sockets = sockets.filter((v) => {
        console.log(ws.id === v.id);
        return ws.id !== v.id;
      });
      console.log(sockets.length);
      // sockets 배열의 length를 통해 연결이 끊긴 것을 확인
    });

    ws.on("message", (response) => {
      let obj = JSON.parse(response.toString("UTF-8"));
      let { type, data } = obj;
      
      console.log(data);

      if (type === "send_msg") {
        const botws = new WebSocket("ws://127.0.0.1:5000/ws");
        answer = "";

        botws.on("open", () => {
          console.log("연결");

          botws.send(JSON.stringify({ type: "type", question: "question", message: data}));
        });

        botws.on("message", (data) => {
          const response = data.toString("utf-8");

          // console.log(response)

          try {
            //const cleanString = response.replace(/[\x00-\x1F\x7F]/g, '');

            if (response.includes("\n\"}")) {
              const cleanString = response.replace(/[\x00-\x1F\x7F]/g, '');
              parseString = JSON.parse(cleanString).message;
              parseString += " \n";
            } else {
              parseString = JSON.parse(response).message;
            }

            console.log(parseString)
            if (parseString === "end") {
              ws.send(JSON.stringify({ type: "type", message: answer}));
              answer = "";
              parseString = "";
              return;
            }
  
            answer += parseString;

          } catch (err) {
            console.error(err);
          }


        });

        botws.on("error", (err) => {
          console.log(err);
        });

        botws.on("close", () => {
          console.log(`closed fastAPI websocket`);
        });
      }
    });

  });
};
