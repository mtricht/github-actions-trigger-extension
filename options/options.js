const exampleJson = `[
  {
    "repository": "mtricht/lunaris",
    "name": "test",
    "parameters": [
      {
        "name": "param1",
        "type": "string"
      },
      {
        "name": "param2",
        "type": "boolean"
      },
      {
        "name": "param3",
        "type": "select",
        "options": [
          "prod",
          "acc"
        ]
      },
      {
        "name": "param4",
        "type": "select",
        "optionsFrom": "mtricht/lunaris",
        "tags": true,
        "branches": true
      }
    ]
  }
]`;

function saveOptions(e) {
  e.preventDefault();
  var triggers = document.querySelector("#triggers").value;
  try {
    JSON.parse(triggers);
  } catch (e) {
    displayMessage("Invalid JSON given: " + e, true);
    return;
  }
  browser.storage.local.set({
    pat: document.querySelector("#pat").value,
    triggers: triggers
  });
  displayMessage("Successfully saved!", false);
}

function displayMessage(str, isError) {
  document.querySelector("#message").innerHTML = str;
  document.querySelector("#message").style.color = isError ? "red" : "green";
  if (!isError) {
    setTimeout(() => document.querySelector("#message").innerHTML = "", 3000);
  }
}

async function setupOptions() {
  const { pat } = await browser.storage.local.get("pat");
  if (pat != undefined) {
    document.querySelector("#pat").value = pat;
  }
  const { triggers } = await browser.storage.local.get("triggers");
  if (triggers != undefined) {
    document.querySelector("#triggers").value = triggers;
  } else {
    document.querySelector("#triggers").value = exampleJson;
  }
}

document.addEventListener("DOMContentLoaded", setupOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

const textarea = document.querySelector("#triggers")

textarea.addEventListener("keydown", (e) => {
  let { keyCode } = e;
  let { value, selectionStart, selectionEnd } = textarea;
  const tab = 9;
  if (keyCode === tab) {
    e.preventDefault();
    textarea.value = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
    textarea.setSelectionRange(selectionStart + 2, selectionStart + 2)
  }
});