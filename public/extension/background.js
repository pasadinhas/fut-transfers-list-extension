console.log("Background script running...");

chrome.storage.local.get("data", (data) => console.log(data));

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});

chrome.runtime.onMessageExternal.addListener((message) => {
  console.log("received external message: ", message)
  if (message.clubItems) {
    chrome.storage.local.set({
        clubItems: message.clubItems
    }, () => {
      if (chrome.runtime.lastError) {
        console.warn("Chrome error: ", chrome.runtime.lastError);
      } else {
        console.log(`Club items data saved to Chrome local storage.`);
      }
    })
  } else {
    chrome.storage.local.set(
      {
        data: {
          version: 1,
          updatedAt: Date.now(),
          transfersList: message,
        },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn("Chrome error: ", chrome.runtime.lastError);
        } else {
          console.log(`Transfers list data saved to Chrome local storage.`);
        }
      }
    );
  }
})

chrome.action.onClicked.addListener(function(tab) {
    console.log('clicked!')
    chrome.tabs.create({
        'url': chrome.runtime.getURL('index.html')
    }, function(tab) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message, chrome.runtime.lastError)
        }
    });
});