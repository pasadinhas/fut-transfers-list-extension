console.log("Content script running...")

const poll = setInterval(() => {
  const collection = services?.SBC?.itemRepository?.transfer?._collection || {};
  if (Object.keys(collection).length) {
    chrome.runtime.sendMessage(document.querySelector("meta[name=fut-transfers-list-extension-id]").content, collection)
    clearInterval(poll);
  }
}, 1000);

function uploadButtonLabel() {
  const numberOfClubItems = Object.values(services?.Academy?.academyDAO?.itemRepo?.club?.items?._collection || {}).length
  return `Upload club items (${numberOfClubItems})`;
}

function stringifyWithCircularCheck(obj) {
  var visitedObjects = new WeakSet();

  return JSON.stringify(obj, function(key, value) {
      if (typeof value === 'object' && value !== null) {
          // Check for circular reference
          if (visitedObjects.has(value)) {
              return '[Circular Reference]';
          }

          // Mark this object as visited
          visitedObjects.add(value);
      }

      return value;
  });
}

setTimeout(() => {
  
  const header = document.querySelector(".fc-header-view");
  
  const uploadClubItems = document.createElement("button");
  uploadClubItems.textContent = uploadButtonLabel();
  uploadClubItems.style.marginInline = "20px";
  uploadClubItems.style.paddingInline = "5px";
  uploadClubItems.style.marginBlock = "10px";
  uploadClubItems.style.height = "calc(100% - 20px - 2px)";
  uploadClubItems.style.border = "1px solid #fcfcf777";
  uploadClubItems.style.borderRadius = "5px";

  uploadClubItems.onclick = () => {
    const clubItems = services?.Academy?.academyDAO?.itemRepo?.club?.items?._collection || {};
    const clubItemsWithoutCircularReferences = JSON.parse(stringifyWithCircularCheck(clubItems));
    chrome.runtime.sendMessage(document.querySelector("meta[name=fut-transfers-list-extension-id]").content, {clubItems: clubItemsWithoutCircularReferences})
  }

  header.insertBefore(uploadClubItems, header.lastChild);

  setInterval(() => {
    uploadClubItems.textContent = uploadButtonLabel();
  }, 1000);
}, 2000)