// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  await chrome.sidePanel.setOptions({
    tabId,
    path: './pages/sidepanel.html',
    enabled: true
  });

  if (info.status === 'complete' && /^http/.test(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["./scripts/jquery-3.7.0.min.js"]
    })
      .then(() => {
        console.log("INJECTED THE JQUERY SCRIPT.");

        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["./scripts/foreground.js"]
        })
          .then(() => {
            console.log("INJECTED THE FOREGROUND SCRIPT.");
          })
          .catch(err => console.log(err));

      })
      .catch(err => console.log(err));

    // chrome.scripting.insertCSS({
    //   target: { tabId: tabId },
    //   files: ["./foreground_styles.css"]
    // })
    //   .then(() => {
    //       console.log("INJECTED THE FOREGROUND STYLES.");
    //   })
    //   .catch(err => console.log(err));
  }

});

chrome.storage.sync.get('createdTabId', data => {

  let existTab = false;

  if (typeof data.createdTabId !== 'undefined')
  {
    chrome.tabs.get(data.createdTabId, () => {
      if (chrome.runtime.lastError) {
        chrome.storage.sync.remove('createdTabId');
      }
      else {
        existTab = true;
      }

      if (!existTab) {
        createTab();
      }
    });
  }
  else {
    createTab();
  }
  
});

async function createTab() {
  // step 1: create tab
  chrome.tabs.create({
    // tab properties
    active: false,
    url: 'https://www.bc.co/game/crash'

  }, ({ id: createdTabId }) => {

    chrome.storage.sync.set({ createdTabId });

    // step 2: register listener to receive message from tab
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // step 4. using tab id to identify response from same tab
      if (sender.url.includes('chrome-extension://') === false && createdTabId !== sender.tab.id) return;

      if (request.message === 'START') {
        chrome.storage.sync.set({ amount: request.payload.amount });
        chrome.storage.sync.set({ ratio: request.payload.ratio });
        chrome.storage.sync.set({ bot_status: true });
        chrome.storage.sync.set({ rowNumber: 0 });

        return true;
      }
      else if (request.message === 'STOP') {

        chrome.storage.sync.set({ bot_status: false });

        chrome.storage.sync.remove('amount');
        chrome.storage.sync.remove('ratio');
        chrome.storage.sync.remove('score');

        return true;
      }
      else if (request.message === 'BOT_STATUS') {
        chrome.storage.sync.get('bot_status', data => {
          if (chrome.runtime.lastError) {
            sendResponse({
              message: 'fail'
            });

            return;
          }

          sendResponse({
            message: 'success',
            payload: data.bot_status
          });
        });

        return true;
      }
      else if (request.message === 'END_STAGE') {
        var lastValue;
        var botStatus;

        if (request.payload.joined == false) {
          chrome.storage.sync.get('bot_status', data2 => {
            if (chrome.runtime.lastError) {
              botStatus = false;
            }
            else {
              botStatus = data2.bot_status;
            }

            sendResponse({
              message: 'success',
              payload: botStatus
            });
          });

          return true;
        }

        chrome.storage.sync.get('score', data1 => {

          if (chrome.runtime.lastError) {
            lastValue = null;
          }
          else {
            lastValue = data1.score;
          }

          chrome.storage.sync.get('bot_status', data2 => {
            if (chrome.runtime.lastError) {
              botStatus = false;
            }
            else {
              botStatus = data2.bot_status;
            }

            if (lastValue !== request.payload.score) {

              chrome.storage.sync.set({
                score: request.payload.score
              }, () => {
                if (chrome.runtime.lastError) {
                  sendResponse({ message: 'fail' });
                  return;
                }

                chrome.storage.sync.get('rowNumber', data3 => {
                  chrome.storage.sync.set({ rowNumber: data3.rowNumber + 1 }, () => {
                    if (chrome.runtime.lastError) {
                      sendResponse({ message: 'fail' });
                      return;
                    }

                    sendResponse({
                      message: 'success',
                      payload: botStatus
                    });
                  })
                });
              })
            }

          });
        });

        return true;
      }
      else if (request.message === 'GET_SCORE') {
        let scoreValue;

        chrome.storage.sync.get('score', data => {
          if (chrome.runtime.lastError) {
            sendResponse({ message: 'fail' });

            return;
          }

          scoreValue = data;

          chrome.storage.sync.get('rowNumber', data1 => {
            if (chrome.runtime.lastError) {
              sendResponse({ message: 'fail' });

              return;
            }

            sendResponse({
              message: 'success',
              rowNumber: data1,
              payload: scoreValue
            });
          });
        });

        return true;
      }
      else if (request.message === 'INITIAL_VALUES') {
        let amount, ratio;

        chrome.storage.sync.get('amount', data => {
          if (chrome.runtime.lastError) {
            amount = 10;
          } else {
            amount = data.amount;
          }

          chrome.storage.sync.get('ratio', data => {
            if (chrome.runtime.lastError) {
              ratio = 10;
            } else {
              ratio = data.ratio;
            }

            sendResponse({
              message: 'success',
              payload: { amount, ratio }
            });

          });
        });

        return true;
      }
      else if (request.message === 'BEFORE_BET') {
        const values = beforeBet();

        sendResponse({
          message: 'success',
          payload: {amount: values.amount, ratio: values.ratio}
        });
      }
      else if (request.message === 'AFTER_BET') {
        afterBet(request.payload);

        sendResponse({
          message: 'success'
        });
      }
    });

    // step 3: programmatically load content script after registering listener
    // in MV3 this is called: chrome.scripting.executeScript
    //chrome.tabs.executeScript(createdTabId, {file: 'background.js'});
  });
}

var currentBet = 0;
var Zarib = 1.2;
var MaxBet = 0;

var Bet1 = 10;
var Bet2 = 10;
var Bet3 = 10;
var Bet4 = 10;
var Bet5 = 10;
var Bet6 = 10;
var UseJob = 0;
var BetJob = 0;
var Use3Job = 0;
var i = 0;
var ii = 0;
var iii = 0;
var BetJob1 = 0;
var BetJob1Zarib = 1.35;
var BetJob2 = 0;
var BetJob2Zarib = 1.78;
var BetJob3 = 0;
var BetJob3Zarib = 1.48;
var BetJob4 = 0;
var BetJob4Zarib = 1.68;
var BetJob5 = 0;
var BetJob5Zarib = 1.78;
var MaxZarar = 0;
var MaxLevel = 0;

var GameCounter = 0;

var TotalZarar = 0;

function beforeBet() {
  GameCounter = GameCounter + 1;

  if (MaxZarar <= TotalZarar) {
      MaxZarar = TotalZarar;
  }

  if (UseJob == 0) {
      i = i + 1;
  }

  if (i >= 7 && TotalZarar <= 0) {
      TotalZarar = 0;
      UseJob = 0;
      Use3Job = 0;
      i = 1;
      ii = 0;
      iii = 0;
  }

  if (i > 6 && TotalZarar > 0) {
      i = 0;
      UseJob = 1;
  }

  if (UseJob == 1) {
      ii = ii + 1;
      iii = iii + 1;
  }

  if (iii == 1) {
      BetJob1 = TotalZarar / 0.71;
  }

  if (iii == 4) {
      BetJob2 = TotalZarar / 2;
  }

  if (iii == 7) {
      BetJob3 = TotalZarar / 1.3;
  }

  if (iii == 10) {
      BetJob4 = TotalZarar / 1.8;
  }

  if (iii == 13) {
      BetJob5 = TotalZarar / 2.2;
  }

  if (UseJob == 1 && iii >= 1 && iii < 4) {
      BetJob = BetJob1;
      Zarib = BetJob1Zarib;
      Use3Job = 3;
  }

  if (UseJob == 1 && iii >= 4 && iii < 7) {
      BetJob = BetJob2;
      Zarib = BetJob2Zarib;
      Use3Job = 3;
  }

  if (UseJob == 1 && iii >= 7 && iii < 10) {
      BetJob = BetJob3;
      Zarib = BetJob3Zarib;
      Use3Job = 3;
  }

  if (UseJob == 1 && iii >= 10 && iii < 13) {
      BetJob = BetJob4;
      Zarib = BetJob4Zarib;
      Use3Job = 3;
  }

  if (UseJob == 1 && iii >= 13 && iii < 16) {
      BetJob = BetJob5;
      Zarib = BetJob5Zarib;
      Use3Job = 3;
  }

  if (UseJob == 1 && iii >= 16 && iii < 23) {
      BetJob = TotalZarar / (1.9 + iii - 16);
      Zarib = iii - 13;
      Use3Job = 1;
  }

  if (UseJob == 1 && iii >= 23) {
      BetJob = TotalZarar / 8.8;
      Zarib = 10;
      Use3Job = 1;
  }

  if (UseJob == 1 && Use3Job >= 1) {
      currentBet = BetJob;
  }

  if (i == 1 && UseJob == 0) {
      currentBet = Bet1;
      Zarib = 1.98;
  }

  if (i == 2 && UseJob == 0) {
      currentBet = Bet2;
      Zarib = 1.98;
  }

  if (i == 3 && UseJob == 0) {
      currentBet = Bet3;
      Zarib = 1.98;
  }

  if (i == 4 && UseJob == 0) {
      currentBet = Bet4;
      Zarib = 1.2;
  }

  if (i == 5 && UseJob == 0) {
      currentBet = Bet5;
      Zarib = 1.2;
  }

  if (i == 6 && UseJob == 0) {
      currentBet = Bet6;
      Zarib = 1.2;
  }

  if (currentBet < 1) {
      currentBet = 1;
  }

  return { amount: currentBet, ratio: Zarib };
}

function afterBet(chance) {

  if (MaxBet <= currentBet) {
      MaxBet = currentBet;
  }

  if (ii >= 3) {
      ii = 0;
      Use3Job = 0;
  }

  let result = chance.replace("x", "");

  //  console.log(result);
  if (parseFloat(result) >= Zarib) {
      onWin();
  }
  else {
      onLose();
  }

  if (MaxLevel <= iii) {
      MaxLevel = iii;
  }
}

function onWin() {
  if (UseJob == 1) {
      TotalZarar = TotalZarar - ((Zarib - 1) * currentBet);
      if (TotalZarar <= 0) {
          TotalZarar = 0;
          BetJob = 0;
          UseJob = 0;
          Use3Job = 0;
          ii = 0;
          iii = 0;
      }
  } else {
      TotalZarar = TotalZarar - ((Zarib - 1) * currentBet);
  }
}

function onLose() {
  TotalZarar = TotalZarar + currentBet;
}