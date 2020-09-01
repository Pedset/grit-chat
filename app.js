(function (){
  let peer = null;
  let conn = null;
const peerOnOpen = (id) => {
  document.querySelector(".my-peer-id").innerHTML = id;
};


const peerOnError = (error) => {
  console.log(error);
};

const connectToPeerClick = (el) =>{
 const peerId = el.target.textContent.replace(/-/g, '');
 console.log(peerId);


 if (conn!==null){
  conn.close();
  let xxs = document.querySelector(".connect-button.connected");
  if (xxs!==null){
    xxs.classList.remove("connected");
  }
 }
  


 //conn && conn.close();

 conn = peer.connect(peerId);
 conn.on("open", ()=>{
   console.log("connection open");
   const event = new CustomEvent("peer-changed", {
     detail: {peerId: peerId},
   });
   document.dispatchEvent(event);

 })
 
 
}

// Connect to Peer
let myPeerId = location.hash.slice(1);

peer = new Peer(myPeerId, {
  host: "glajan.com",
  port: 8443,
  path: "/myapp",
  secure: true,
});

// Handel Peer Event.
peer.on("open", peerOnOpen);
peer.on("error", peerOnError);

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


    document.addEventListener('peer-changed', (e)=>{
      const peerId = e.detail.peerId;
      console.log(peerId);
     let xy = document.querySelector(`.peerId--${peerId}-`);
     xy.classList.add("connected");
    })
  })})();
