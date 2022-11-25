function inject(func) {
  var actualCode = "(" + func + ")();";
  var script = document.createElement("script");
  script.textContent = actualCode;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

document.addEventListener("eaData", function (e) {
  console.log("Content script received: ", e);
  const transfersListItems = e.detail;

  chrome.storage.local.set(
    {
      data: {
        version: 1,
        updatedAt: Date.now(),
        transfersList: transfersListItems,
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

  /*
  const players = Object.values(transfersListItems)
    .filter((item) => item.type === "player")
    .reduce((a, v) => ({ ...a, [v._metaData.id]: v }), {});

  const rids = Object.values(players).map((e) => e.id);

  const bucketSize = 30;
  [0, bucketSize, 2 * bucketSize, 3 * bucketSize].forEach((i) => {
    const partialRids = rids.slice(i, i + bucketSize).join(",");
    if (partialRids) {
      fetch(`https://www.futbin.com/22/playerPrices?player=&rids=${partialRids}`)
        .then((r) => r.json())
        .then((json) => {
          for ([id, prices] of Object.entries(json)) {
            if (id == 0) continue;
            const price = prices.prices.ps.LCPrice;
            players[id].price = price;
          }
        });
    }
  });

  console.log({ transfersListItems, rids, players });
  console.table(players)
  */
});

inject(() => {
  const poll = setInterval(() => {
    const collection =
      services?.SBC?.itemRepository?.transfer?._collection || {};
    if (Object.keys(collection).length) {
      document.dispatchEvent(new CustomEvent("eaData", { detail: collection }));
      clearInterval(poll);
    }
  }, 1000);
});
