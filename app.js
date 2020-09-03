(function () {
  function printMessage(message, writer) {
    console.log(message);
    const messagesDiv = document.querySelector(".messages");
    const newMessageDiv = document.createElement("div");
    const messageWrapperDiv = document.createElement("div");
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }
    newMessageDiv.innerText = "(" + h + ":" + m + ":" + s + ") " + message;
    messageWrapperDiv.classList.add("message");
    messageWrapperDiv.classList.add(writer);
    messageWrapperDiv.appendChild(newMessageDiv);
    messagesDiv.appendChild(messageWrapperDiv);
  }

  let peer = null;
  let conn = null;
  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };

  const peerOnConnection = (dataConnection) => {
    if (conn !== null) {
      conn.close();
      let xxss = document.querySelector(".connect-button.connected");
      if (xxss !== null) {
        xxss.classList.remove("connected");
      }
    }

    conn = dataConnection;
    conn.on("data", (data) => {
      console.log("This is from peerOnConnection data:" + data);

      printMessage(data, "me");
    });

    console.log(conn);
    const eventx = new CustomEvent("peer-changed", {
      detail: { peerId: conn.peer },
    });
    document.dispatchEvent(eventx);
  };

  function x() {
    const message = document.querySelector(".new-message").value;
    console.log("MESSAGE IS:" + message);
    if (message !== "") {
      console.log("This is from peerOnConnection message:" + message);
      conn.send(message);
      printMessage(message, "them");
      document.querySelector(".new-message").value = "";
    }
  }

  const sendButton = document.querySelector(".send-new-message-button");
  sendButton.addEventListener("click", () => {
    x();
  });

  document.querySelector("body").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      x();
    }
  });

  const peerOnError = (error) => {
    console.log(error);
  };

  const connectToPeerClick = (el) => {
    const peerId = el.target.textContent.replace(/-/g, "");
    console.log(peerId);

    if (conn !== null) {
      conn.close();
      let xxs = document.querySelector(".connect-button.connected");
      if (xxs !== null) {
        xxs.classList.remove("connected");
      }
    }

    //conn && conn.close();

    conn = peer.connect(peerId);
    conn.on("open", () => {
      console.log("connection open");
      const event = new CustomEvent("peer-changed", {
        detail: { peerId: peerId },
      });
      document.dispatchEvent(event);
      conn.on("data", (data) => {
        console.log("this is from ConnectToPeerClick data:" + data);
        printMessage(data, "me");
      });
    });
  };

  // Connect to Peer
  let myPeerId = location.hash.slice(1);

  peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        { url: ["stun:eu-turn7.xirsys.com"] },
        {
          username:
            "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          url: "turn:eu-turn7.xirsys.com:80?transport=udp",
        },
      ],
    },
  });

  // Handel Peer Event.
  peer.on("open", peerOnOpen);
  peer.on("error", peerOnError);
  peer.on("connection", peerOnConnection);

  document
    .querySelector(".list-all-peers-button")
    .addEventListener("click", () => {
      const peersEl = document.querySelector(".peers");
      peersEl.firstChild && peersEl.firstChild.remove();
      const ul = document.createElement("ul");
      peer.listAllPeers((peers) => {
        peers

          .filter((p) => p !== myPeerId)
          .map((nm) => {
            return "-" + nm + "-";
          })
          .forEach((peerId) => {
            const li = document.createElement("li");
            const button = document.createElement("button");
            button.innerText = peerId;
            button.classList.add("connect-button");
            button.classList.add(`peerId-${peerId}`);
            button.addEventListener("click", connectToPeerClick);
            li.appendChild(button);
            ul.appendChild(li);
          });
        peersEl.appendChild(ul);
      });

      document.addEventListener("peer-changed", (e) => {
        const peerId = e.detail.peerId;
        console.log("peerID peerchanged event" + peerId);
        let xy = document.querySelector(`.peerId--${peerId}-`);
        xy.classList.add("connected");
      });
    });
})();
