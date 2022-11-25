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


chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('clicked!')
    chrome.tabs.create({
        'url': chrome.extension.getURL('index.html')
    }, function(tab) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message, chrome.runtime.lastError)
        }
    });
});