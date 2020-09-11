(function () {
  let peer = null;
  let conn = null;
  let mediaConn = null;

  function printMessage(message, writer) {
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
    if (writer === "them") {
      newMessageDiv.innerText = "(" + h + ":" + m + ":" + s + ") " + message;
    } else {
      newMessageDiv.innerText = message + " (" + h + ":" + m + ":" + s + ")";
    }
    messageWrapperDiv.classList.add("message");
    messageWrapperDiv.classList.add(writer);
    messageWrapperDiv.appendChild(newMessageDiv);
    messagesDiv.appendChild(messageWrapperDiv);
    messagesDiv.scrollTo(0, messagesDiv.scrollHeight);
  }

  //on peer event call

  const peerOnCall = (incomingCall) => {
    if (confirm("answer Call from " + incomingCall.peer)) {
      mediaConn && mediaConn.close();
      // answer incoming call.
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((myStream) => {
          mediaConn = incomingCall;
          incomingCall.answer(myStream);
          mediaConn.on("stream", mediaConnOnStream);
          const video = document.querySelector(".video-container.them");
          const startBtn = video.querySelector(".start");
          const stopBtn = video.querySelector(".stop");
          startBtn.classList.remove("active");
          stopBtn.classList.add("active");
        });
    }
  };

  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };

  const peerOnConnection = (dataConnection) => {
    if (conn !== null) {
      conn.close();
      let connected_button = document.querySelector(
        ".connect-button.connected"
      );
      if (connected_button !== null) {
        connected_button.classList.remove("connected");
      }
    }

    conn = dataConnection;
    conn.on("data", (data) => {
      console.log("This is from peerOnConnection data:" + data);

      printMessage(data, "me");
    });

    const peerChangeEvent = new CustomEvent("peer-changed", {
      detail: { peerId: conn.peer },
    });
    document.dispatchEvent(peerChangeEvent);
  };

  function sendMesssage() {
    const message = document.querySelector(".new-message").value;
    if (message !== "") {
      conn.send(message);
      printMessage(message, "them");
      document.querySelector(".new-message").value = "";
    }
  }

  const sendButton = document.querySelector(".send-new-message-button");
  sendButton.addEventListener("click", () => {
    sendMesssage();
  });

  document.querySelector("body").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      sendMesssage();
    }
  });

  const peerOnError = (error) => {
    console.log(error);
  };

  const connectToPeerClick = (el) => {
    const peerId = el.target.textContent.slice(
      1,
      el.target.textContent.length - 1
    );

    if (conn !== null) {
      conn && conn.close();
      let connected_button = document.querySelector(
        ".connect-button.connected"
      );
      if (connected_button !== null) {
        connected_button.classList.remove("connected");
      }
    }
    conn = peer.connect(peerId);
    conn.on("open", () => {
      console.log("connection open");
      const event_Peer_changed = new CustomEvent("peer-changed", {
        detail: { peerId: peerId },
      });
      document.dispatchEvent(event_Peer_changed);
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
  peer.on("call", peerOnCall);

  //display video of me
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then((stream) => {
      const video = document.querySelector(".video-container.me video");
      video.muted = true;
      video.srcObject = stream;
    });

  const mediaConnOnStream = (theirStream) => {
    const video = document.querySelector(".video-container.them video");
    video.muted = true;
    video.srcObject = theirStream;
  };
  // stop video handler

  const stopVideoCallClick = () => {
    const video = document.querySelector(".video-container.them");
    const startBtn = video.querySelector(".start");
    const stopBtn = video.querySelector(".stop");
    stopBtn.classList.remove("active");
    startBtn.classList.add("active");
    mediaConn.close();
  };
  document
    .querySelector(".video-container.them .stop")
    .addEventListener("click", stopVideoCallClick);
  // start video click handler

  const startVideoCallClick = () => {
    const video = document.querySelector(".video-container.them");
    const startBtn = video.querySelector(".start");
    const stopBtn = video.querySelector(".stop");
    startBtn.classList.remove("active");
    stopBtn.classList.add("active");

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((myStream) => {
        mediaConn && mediaConn.close();
        mediaConn = peer.call(conn.peer, myStream);
        mediaConn.on("stream", mediaConnOnStream);
      });
  };

  //start video click handler
  document
    .querySelector(".video-container.them .start")
    .addEventListener("click", startVideoCallClick);

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
        let peerIdClass = document.querySelector(`.peerId--${peerId}-`);
        peerIdClass.classList.add("connected");

        //update video subtext
        const video = document.querySelector(".video-container.them");
        video.querySelector(".name").innerHTML =
          'Connected to "' + peerId + '"';
        video.classList.add("connected");
        video.querySelector(".stop").classList.remove("active");
        video.querySelector(".start").classList.add("active");
      });
    });
})();
