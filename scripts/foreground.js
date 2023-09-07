var timer;
var issus, chance;

var amount = 0.0, ratio = 0.0;

var botStatus = false;

var inputAmount, inputRatio;
var buttonBet;

var joined = false;

function getData() {

  let newIssus = document.querySelector(".recent-list .game-item:last-child > div.issus").innerText;
  let newChance = document.querySelector(".recent-list .game-item:last-child > div:nth-child(2)").innerText;

  if (newIssus !== issus && newChance !== chance) {
    issus = newIssus;
    chance = newChance;

    if (issus !== undefined && chance !== undefined) {

      chrome.runtime.sendMessage({
        message: "AFTER_BET",
        payload: chance
      }, responseAfterBet => {
        if (responseAfterBet.message === 'success') {

          let score = getLastScore();

          chrome.runtime.sendMessage({
            message: "END_STAGE",
            payload: { joined, score }
          }, responseEndStage => {

            if (responseEndStage.message === 'success') {
              botStatus = responseEndStage.payload;

              console.log( score );

              if (botStatus) {

                chrome.runtime.sendMessage({
                  message: "BEFORE_BET",
                }, responseBeforeBet => {

                  if (responseBeforeBet.message === 'success') {
                    amount = responseBeforeBet.payload.amount;
                    ratio = responseBeforeBet.payload.ratio;

                    if (amount === undefined || ratio === undefined) return;

                    if (inputAmount !== undefined && inputRatio !== undefined) {

                      typeWithDelay(inputAmount, amount.toString());

                      typeWithDelay(inputRatio, ratio.toString());

                      const timeoutMilliseconds = 5000; // Adjust the timeout as needed
                      findBetButton('.wpn4k9r .b1m9zn1q', timeoutMilliseconds)
                        .then((element) => {

                          randomNumber = Math.floor(Math.random() * (1501 - 500)) + 500;
                          setTimeout(() => {
                            element.focus();
                            element.click();
                            joined = true;
                          }, randomNumber);
                        })
                        .catch((error) => {
                          joined = false;
                        });
                    }
                  }
                });

              }
            }
          });
        }
      });
    }
  }
}

function findBetButton(query, timeoutMs) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function search() {
      const element = document.querySelector(query);

      if ((element.innerHTML === '<div class="button-inner"><div>Bet</div></div>' ||
        element.innerHTML === '<div class="button-inner"><div>Bet</div><div class="sub-text">(Next round)</div></div>') && element.hasAttribute('disabled') == false) {
        resolve(element);
      } else if (Date.now() - startTime >= timeoutMs) {
        reject(new Error('Element not found within the specified timeout.'));
      } else {
        requestAnimationFrame(search);
      }
    }

    search();
  });
}

function typeWithDelay(inputElement, textToType) {
  inputElement.click();
  inputElement.focus();

  inputElement.value = textToType;
  inputElement.setAttribute('value', textToType);
  var inputEvent = new Event("input", { bubbles: true, cancelable: true });
  inputElement.dispatchEvent(inputEvent);
}

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getLastScore() {
  lastRow = document.querySelector('.bn59vbi table tbody tr:first');
  col1 = lastRow.getElementsByClassName('hash ellipsis')[0].innerText;
  col2 = lastRow.querySelector('td.bet > div > div > span').innerText;
  col3 = lastRow.querySelector('td:nth-child(3)').innerText;
  col4 = lastRow.querySelector('td.payout').innerText;
  col5 = lastRow.querySelector('td.profitline > div > div > span').innerText;

  delete lastRow;

  return { id: col1, bet: col2, time: col3, payout: col4, profit: col5 };
}

$(function () {
  inputAmount = document.querySelector(".game-coin-amount-input .input-control > input");
  inputRatio = document.querySelector(".cashout-input .input-control > input");

  // start timer to check stage status
  timer = setInterval(getData, 1000);
});