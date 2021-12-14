console.log("Creating Worker");
var myWorker = new SharedWorker("worker.js");

function sendPassword() {
  const pwd = document.getElementById("password").value;
  console.log("sending password to worker", pwd);
  myWorker.port.postMessage(["password", pwd]);
}
function decrypt() {
  const source = document
    .getElementById("encrypted")
    .innerHTML.replace(/\n|\s/g, "");

  console.log("Requesting decryption");
  myWorker.port.postMessage(["decrypt", source]);
}

myWorker.port.onmessage = function (e) {
  // console.log("from worker", e.data);
  const [type, ...args] = e.data;

  switch (type) {
    case "is-ready":
      const isReady = args[0] === true;

      if (isReady) {
        document.getElementById("password").value = "*****";
        console.log("Worker has the password.");
        decrypt();
      } else {
        console.log(`Worker doesn't have the password.`);
      }

      break;

    case "decrypt":
      console.log("Message decrypted", args);
      document.getElementById("decrypted").innerHTML = args[0];
      break;
  }
};
