console.group("Worker created");
let password = null;
const ports = [];

onconnect = function (e) {
  var port = e.ports[0];
  ports.push(port);

  // Tell the new client our status ready
  port.postMessage(["is-ready", password != null]);

  port.onmessage = async function (e) {
    const [type, ...args] = e.data;

    switch (type) {
      case "is-ready":
        port.postMessage([type, password != null]);
        break;

      case "password":
        password = args[0];
        port.postMessage(["is-ready", password != null]);
        break;

      case "decrypt":
        port.postMessage([type, await decrypt(args[0], password)]);
        break;
    }

    console.log("message received by worker", e.data);
  };
};

async function encrypt(plaintext, password) {
  const pwUtf8 = new TextEncoder().encode(password);
  const pwHash = await crypto.subtle.digest("SHA-256", pwUtf8);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ivStr = Array.from(iv)
    .map((b) => String.fromCharCode(b))
    .join("");

  const alg = { name: "AES-GCM", iv: iv };

  const key = await crypto.subtle.importKey("raw", pwHash, alg, false, [
    "encrypt",
  ]);

  const ptUint8 = new TextEncoder().encode(plaintext);
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);

  const ctArray = Array.from(new Uint8Array(ctBuffer));
  const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join("");

  return btoa(ivStr + ctStr);
}

async function decrypt(ciphertext, password) {
  const pwUtf8 = new TextEncoder().encode(password);
  const pwHash = await crypto.subtle.digest("SHA-256", pwUtf8);

  const ivStr = atob(ciphertext).slice(0, 12);
  const iv = new Uint8Array(Array.from(ivStr).map((ch) => ch.charCodeAt(0)));

  const alg = { name: "AES-GCM", iv: iv };

  const key = await crypto.subtle.importKey("raw", pwHash, alg, false, [
    "decrypt",
  ]);

  const ctStr = atob(ciphertext).slice(12);
  const ctUint8 = new Uint8Array(
    Array.from(ctStr).map((ch) => ch.charCodeAt(0))
  );
  // note: why doesn't ctUint8 = new TextEncoder().encode(ctStr) work?

  try {
    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
    const plaintext = new TextDecoder().decode(plainBuffer);
    return plaintext;
  } catch (e) {
    throw new Error("Decrypt failed");
  }
}
