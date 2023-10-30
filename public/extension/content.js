console.log("Content script running...")

const poll = setInterval(() => {
  const collection = services?.SBC?.itemRepository?.transfer?._collection || {};
  if (Object.keys(collection).length) {
    chrome.runtime.sendMessage("ojdoehhgfmochaadoomgaafgljlkkjnm", collection)
    clearInterval(poll);
  }
}, 1000);
