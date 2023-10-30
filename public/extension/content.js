console.log("Content script running...")

const poll = setInterval(() => {
  const collection = services?.SBC?.itemRepository?.transfer?._collection || {};
  if (Object.keys(collection).length) {
    chrome.runtime.sendMessage(document.querySelector("meta[name=fut-transfers-list-extension-id]").content, collection)
    clearInterval(poll);
  }
}, 1000);
