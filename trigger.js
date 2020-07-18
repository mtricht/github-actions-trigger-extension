async function dispatch(e, trigger) {
  e.preventDefault();
  const button = document.querySelector("#gat-form > button");
  button.disabled = true
  const body = {
    event_type: trigger.name,
    client_payload: {}
  };
  trigger.parameters.forEach(parameter => {
    const element = document.querySelector(`#gat-${parameter.name}`);
    switch (parameter.type) {
      case "string":
        body.client_payload[parameter.name] = element.value;
        break;
      case "boolean":
        body.client_payload[parameter.name] = element.checked;
        break;
      case "select":
        body.client_payload[parameter.name] = element.options[element.selectedIndex].value;
        break;
    }
  });
  fetch(`https://api.github.com/repos/${trigger.repository}/dispatches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/vnd.github.everest-preview+json",
      "Authorization": `Bearer ${pat}`
    },
    body: JSON.stringify(body)
  })
    .then(data => {
      if (data.status != 204) {
        throw new Error(`Status code was ${data.status}`)
      }
      document.querySelector("#gat-message").innerHTML = "<br />Trigger successfully sent! Refresh to see its status.";
      document.querySelector("#gat-message").style.color = "green";
      button.disabled = false
    })
    .catch(error => {
      document.querySelector("#gat-message").innerHTML = `<br />${error}`;
      document.querySelector("#gat-message").style.color = "red";
      button.disabled = false
    });
}

async function renderTrigger(e, triggers) {
  const triggerName = e.target.value;
  const filteredTriggers = triggers.filter(trigger => trigger.name == triggerName);
  const trigger = filteredTriggers.length == 0 ? null : filteredTriggers[0];
  const contentElement = document.querySelector("#gat-content");
  if (triggerName == "" || trigger == null) {
    contentElement.innerHTML = "";
    return;
  }
  const inputs = await Promise.all(trigger.parameters.map(async parameter => {
    let input = "";
    switch (parameter.type) {
      case "string":
        input = `<input class="form-control" type="text" id="gat-${parameter.name}" />`;
        break;
      case "boolean":
        input = `<input type="checkbox" id="gat-${parameter.name}" />`;
        break;
      case "select":
        let optionValues = [];
        if ('options' in parameter) {
          optionValues = optionValues.concat(parameter.options);
        }
        if ('optionsFrom' in parameter) {
          if ('tags' in parameter && parameter.tags) {
            optionValues = optionValues.concat(await getRefs(parameter.optionsFrom, 'tags'));
          }
          if ('branches' in parameter && parameter.branches) {
            optionValues = optionValues.concat(await getRefs(parameter.optionsFrom, 'heads'));
          }
        }
        const options = optionValues.map(option => {
          return `<option value="${option}">${option}</option>`;
        }).join("");
        input = `<select class="form-select" id="gat-${parameter.name}">${options}</select>`;
    }
    return `<dl class="form-group"><dt><label>${parameter.name}</label></dt><dd>${input}</dd></dl>`
  }));
  contentElement.innerHTML = `<form id="gat-form" style="padding: 5px; margin-top: 5px;" class="Box">
  ${inputs.join("")}
  <button class= "btn btn-primary">Trigger</button>
  <span id="gat-message"></span>
  </form>`;
  document.querySelector("#gat-form").addEventListener("submit", (e) => dispatch(e, trigger));
}

async function getRefs(repository, matchingRef) {
  let response = await fetch(`https://api.github.com/repos/${repository}/git/matching-refs/${matchingRef}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${pat}`
    }
  });
  const refResponse = await response.json();
  return refResponse.map(ref => ref.ref.replace(`refs/${matchingRef}/`, ""));
}

async function run() {
  const actionsTab = document.querySelector(`[data-tab-item="actions-tab"]`);
  if (!actionsTab.classList.contains("selected")) {
    return;
  }
  if (document.querySelector("#gat-container") != null) {
    return;
  }
  const storage = await browser.storage.local.get(["pat", "triggers"]);
  const mainContent = document.querySelector("main > .container-xl");
  if (storage.pat == undefined || storage.pat == "" || storage.triggers == undefined || storage.triggers == "") {
    mainContent.insertAdjacentHTML("afterbegin", `<div id="gat-container">GAT - Please configure triggers first.</div>`);
    return;
  }
  pat = storage.pat;
  let filteredTriggers = [];
  try {
    JSON.parse(storage.triggers).forEach(trigger => {
      if (trigger.repository.toLowerCase() == repository) {
        filteredTriggers.push(trigger);
      }
    });
  } catch (e) {
    mainContent.insertAdjacentHTML("afterbegin", `<div id="gat-container">GAT - Trigger JSON is invalid, please reconfigure.</div>`);
    return;
  }
  if (filteredTriggers.length == 0) {
    mainContent.insertAdjacentHTML("afterbegin", `<div id="gat-container">GAT - No triggers configured for this repository.</div>`);
    return;
  }
  const options = filteredTriggers.map((trigger) => {
    return `<option value="${trigger.name}">${trigger.name}</option>`;
  });
  mainContent.insertAdjacentHTML("afterbegin", `<div id="gat-container"><select class="form-select" id="gat-triggers">
      <option value="">Select a trigger</span></option>${options}</select><div id="gat-content"></div></div>`);
  document.querySelector("#gat-triggers").onchange = (e) => renderTrigger(e, filteredTriggers);
}

const locationPaths = window.location.pathname.split("/");
const repository = locationPaths[1].toLowerCase() + "/" + locationPaths[2].toLowerCase();
let pat = "";

run();
setInterval(run, 500);