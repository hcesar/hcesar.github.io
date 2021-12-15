import { str2ab, importRsaKey } from "./utils.js";

const elements = {
  get encrypted() {
    return document.getElementById("encrypted");
  },
  get input() {
    return document.getElementById("input");
  },
  get key() {
    return document.getElementById("key");
  },
};

var vector = crypto.getRandomValues(new Uint8Array(16));

window.encrypt = async function () {
  let [key, encryptedKey] = await getSymmetricalKey();
  let iv = window.crypto.getRandomValues(new Uint8Array(16));

  const encrypted = await crypto.subtle
    .encrypt(
      {
        name: "AES-CTR",
        counter: iv,
        length: 128,
      },
      key,
      str2ab(elements.input.value)
    )
    .catch(console.error);

  //console.log(encrypted);
  const header64 = btoa(String.fromCharCode(...new Uint8Array(encryptedKey)));
  const body64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  elements.encrypted.innerHTML = `ENCRYPTED KEY:\n${header64}\n\nBODY:\n${body64}`;
};

async function getSymmetricalKey() {
  let symmetricalKey = await window.crypto.subtle.generateKey(
    {
      name: "AES-CTR",
      length: 128,
    },
    true,
    ["encrypt", "decrypt"]
  );
  let symmetricalKeyBytes = await crypto.subtle.exportKey(
    "raw",
    symmetricalKey,
    {
      name: "AES-CTR",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  console.log(symmetricalKeyBytes);

  let publicKey = await importRsaKey(elements.key.value).catch(console.error);

  const encryptedSymmetricalKey = await crypto.subtle
    .encrypt({ name: "RSA-OAEP", iv: vector }, publicKey, symmetricalKeyBytes)
    .catch(console.error);

  return [symmetricalKey, encryptedSymmetricalKey];
}
