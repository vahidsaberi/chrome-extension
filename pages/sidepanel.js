let amount = 10.00;
let ratio = 10.00;
var lastScore;
var init;

//check bot is on
chrome.runtime.sendMessage({
  message: "BOT_STATUS"
}, response => {
  if (response.message === 'success' && response.payload) {
    document.getElementById('startBot').textContent = 'Stop';
    chrome.action.setBadgeText({ text: "ON" });
    init = setInterval(getData, 1000);
  }
});

//event to register amount value
document
  .getElementById("botAmount")
  .addEventListener("change", setAmountValue);

function setAmountValue(event) {
  amount = parseFloat(event.target.value);
}

//event to register auto cash out value
document
  .getElementById("botAutoCashOut")
  .addEventListener("change", setAutoCashOutValue);

function setAutoCashOutValue(event) {
  ratio = parseFloat(event.target.value);
}

// timer to get last score
function getData() {
  chrome.runtime.sendMessage({
    message: "GET_SCORE"
  }, response => {
    if (response.message === 'success') {

      //console.log(response);
      if (JSON.stringify(lastScore) !== JSON.stringify(response.payload.score)) {
        lastScore = response.payload.score;

        let rowElement = document.createElement("tr");
        rowElement.classList.add(lastScore.profit.includes("+ ") ? 'table-success' : 'table-danger')

        //console.log(response.rowNumber.rowNumber);
        let indexElement = document.createElement("th");
        indexElement.setAttribute('scope', 'row');
        indexElement.appendChild(document.createTextNode(response.rowNumber.rowNumber.toString()));
        rowElement.appendChild(indexElement);

        let betElement = document.createElement("td");
        betElement.appendChild(document.createTextNode(lastScore.bet));
        rowElement.appendChild(betElement);

        let timeElement = document.createElement("td");
        timeElement.appendChild(document.createTextNode(lastScore.time));
        rowElement.appendChild(timeElement);

        let payoutElement = document.createElement("td");
        payoutElement.appendChild(document.createTextNode(lastScore.payout));
        rowElement.appendChild(payoutElement);

        let profitElement = document.createElement("td");
        profitElement.appendChild(document.createTextNode(lastScore.profit));
        rowElement.appendChild(profitElement);

        document.getElementById('rows-result').prepend(rowElement);
      }
    }
  });
}

//event to start bot
document
  .getElementById("startBot")
  .addEventListener("click", startBot);

function startBot(event) {
  if (event.target.textContent == 'Start') {
    event.target.textContent = 'Stop';
    console.log('Bot started!');
    chrome.action.setBadgeText({ text: "ON" });

    chrome.runtime.sendMessage({ message: 'START', payload: { amount, ratio } });

    init = setInterval(getData, 1000);
  }
  else {
    event.target.textContent = 'Start';
    console.log('Bot stopped!');
    chrome.action.setBadgeText({ text: "" });

    chrome.runtime.sendMessage({ message: 'STOP' });

    clearInterval(init);
  }
}