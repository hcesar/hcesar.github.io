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
  let key = await importRsaKey(elements.key.value).catch(console.error);
  console.log(key);

  const encrypted = await crypto.subtle
    .encrypt(
      { name: "RSA-OAEP", iv: vector },
      key,
      str2ab(elements.input.value)
    )
    .catch(console.error);

  //console.log(encrypted);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  elements.encrypted.innerHTML = b64;
};
