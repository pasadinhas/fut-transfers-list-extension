import { useEffect, useState } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from "@fortawesome/free-regular-svg-icons";
import { faShieldAlt } from "@fortawesome/free-solid-svg-icons";

function imgsrc(id) {
  return `https://www.ea.com/fifa/ultimate-team/web-app/content/22747632-e3df-4904-b3f6-bb0035736505/2022/fut/items/images/mobile/portraits/${id}.png`
  // return `https://futmind.com/images/fifa2022/players/${id}.webp`;
}

function bronzeSilverGold(item) {
  return item._rating < 65 ? "Bronze" : item._rating < 75 ? "Silver" : "Gold";
}

function sort_items(a, b) {
  if (!(a.discardValue == b.discardValue)) {
    return b.discardValue - a.discardValue;
  } else if (!(a._auction.timestamp == b._auction.timestamp)) {
    return a._auction.timestamp - b._auction.timestamp;
  } else {
    return a.timestamp - b.timestamp;
  }
}

function rarity(item) {
  switch (item._rareflag) {
    case 0:
      return `NonRare`;
    case 1:
      return `Rare`;
    case 3:
      return `TOTW`;
    default: {
      console.log("Item version unmmaped: ", item);
      return "Unknown";
    }
  }
}

const fmt = new Intl.NumberFormat();

async function fetchPrices(items, setPrices) {
  const BUCKET_SIZE = 30;

  const rids = items
    .filter((item) => item.type === "player")
    .map((player) => player.definitionId);

  const allPrices = {};
  const startIndices = [0, BUCKET_SIZE, 2 * BUCKET_SIZE, 3 * BUCKET_SIZE];

  for (const i of startIndices) {
    const partialRids = rids.slice(i, i + BUCKET_SIZE).join(",");
    if (partialRids) {
      const result = await fetch(
        `https://www.futbin.com/24/playerPrices?player=&rids=${partialRids}`
      ).then((r) => r.json());

      console.log("Fetched prices from FUTBIN: ", result);

      for (const [id, playerPrice] of Object.entries(result)) {
        if (id == 0) continue;
        const price = playerPrice.prices.ps.LCPrice;
        allPrices[id] = parseInt(`${price}`.replace(/[^\d]/gi, ""), 10);
      }
    }
  }

  setPrices(allPrices);
}

async function fetchDetailedPrice(id, previousDetailedPrices, setDetailedPrices) {
  const result = await fetch(
    `https://www.futbin.com/24/playerPrices?player=${id}&rids=`
  ).then((r) => r.json());

  previousDetailedPrices[id] = (result || {})[id]?.prices?.ps
  setDetailedPrices({ ...previousDetailedPrices })
}

function fontAwesomeDisabled(disabled) {
  return disabled ? "Disabled" : "";
}

function App() {
  const [loading, setLoading] = useState("Application is starting...");
  const [transfersListItems, setTransfersListItems] = useState([]);
  const [prices, setPrices] = useState({});
  const [detailedPrices, setDetailedPrices] = useState({});
  const [nameFilter, setNameFilter] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [maxRatingFilter, setMaxRatingFilter] = useState(100);
  const [tableRowHeight, setTableRowHeight] = useState(5.5);

  function filter_item(item) {
    function filter_name(item) {
      if (!item._nameMatchString) {
        item._nameMatchString = JSON.stringify(item._staticData)
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();
      }
      return (
        item._nameMatchString && item._nameMatchString.includes(nameFilter)
      );
    }

    function filter_rating(item) {
      return item._rating >= minRatingFilter && item._rating <= maxRatingFilter;
    }

    const result = filter_name(item) && filter_rating(item);
    console.log("Filering", item, result)
    return result;
  }

  useEffect(() => {
    (async function () {
      chrome.storage.local.get(["data"], function ({ data }) {
        const { transfersList, updatedAt, version } = data;
        const transfersListItems = Object.values(transfersList);
        fetchPrices(transfersListItems, setPrices);
        setTransfersListItems(transfersListItems);
        setLoading(false);
        window._transfersList = transfersListItems;
        console.log({ transfersList });
      });
    })();
  }, []);


  window.FutTransfersList = { items: transfersListItems }
  console.log(transfersListItems);

  return (
    <div className="App">
      {loading ? (
        <h1>{loading}</h1>
      ) : (
        <>
          <div class="Controls">
            <div className="ControlGroup">
              <input
                className="Control-1-1"
                type="text"
                placeholder="Filter players"
                onChange={(e) => setNameFilter(e.target.value.toLowerCase())}
              />
            </div>
            <div className="ControlGroup">
              <input
                className="Control-2-1"
                type="text"
                placeholder="Min. Rating"
                onChange={(e) => {
                  if (e.target.value == "") {
                    setMinRatingFilter(0);
                    return;
                  }

                  e.target.value.replace(/[^\d.]/gi, "");
                  const value = parseInt(e.target.value, 10);

                  if (value >= 0 && value <= 100) {
                    setMinRatingFilter(value);
                  } else {
                    e.target.value = minRatingFilter || "";
                  }
                }}
              />
              <input
                className="Control-2-2"
                type="text"
                placeholder="Max. Rating"
                onChange={(e) => {
                  if (e.target.value == "") {
                    setMaxRatingFilter(100);
                    return;
                  }

                  e.target.value.replace(/[^\d.]/gi, "");
                  const value = parseInt(e.target.value, 10);

                  if (value >= 0 && value <= 100) {
                    setMaxRatingFilter(value);
                  } else {
                    e.target.value = maxRatingFilter || "";
                  }
                }}
              />
            </div>
            <div className="ControlGroup">
              <input
                type="range"
                min={2}
                max={12}
                step={0.5}
                value={tableRowHeight}
                onChange={(e) => setTableRowHeight(e.target.value)}
              />
            </div>
          </div>
          <div class="Content">
            <table style={{ "--table-height": `${tableRowHeight}vh` }}>
              <tbody>
                {transfersListItems
                  .filter(filter_item)
                  .sort(sort_items)
                  .map(item => {console.log(item); return item})
                  .map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          className={`PlayerPortrait Rating ${rarity(
                            item
                          )} ${bronzeSilverGold(item)}`}
                          src={`https://cdn.futbin.com/content/fifa24/img/players/${item._metaData.id}.png?v=23`}
                          onError={(e) => {
                            if (e.target.src == imgsrc(item._metaData?.id)) {
                              console.warn("No image for item: ", item);
                            } else {
                              //e.target.src = imgsrc(item._metaData?.id);
                            }
                          }}
                        />
                      </td>
                      <td>
                        <FontAwesomeIcon icon="arrow-alt-from-right"></FontAwesomeIcon>
                      </td>
                      <td className="Left">
                        {item?._staticData?.name || "<no name>"}
                      </td>
                      <td>
                        {item._rating && (
                          <div
                            className={`Rating RatingNumber ${rarity(
                              item
                            )} ${bronzeSilverGold(item)}`}
                          >
                            {item._rating}
                          </div>
                        )}
                      </td>
                      <td className="Right">
                        {prices[item.definitionId]
                          ? fmt.format(prices[item.definitionId])
                          : "no data"}
                      </td>
                      <td>
                        <input
                          disabled
                          type="range"
                          max={item._itemPriceLimits.maximum}
                          min={item._itemPriceLimits.minimum}
                          value={prices[item.definitionId]}
                        />
                      </td>
                      {detailedPrices[item.definitionId] != null
                        ? <>
                          <td>
                            <span>{detailedPrices[item.definitionId].updated}</span>
                          </td>
                          <td>
                            <span>{detailedPrices[item.definitionId].LCPrice}</span><br/>
                            <span>{detailedPrices[item.definitionId].LCPrice2}</span><br/>
                            <span>{detailedPrices[item.definitionId].LCPrice3}</span><br/>
                            <span>{detailedPrices[item.definitionId].LCPrice4}</span><br/>
                            <span>{detailedPrices[item.definitionId].LCPrice5}</span>
                          </td>
                          </>
                        : <td colSpan={2}><button
                            className="FetchFutbinData"
                            onClick={(e) => fetchDetailedPrice(item.definitionId, detailedPrices, setDetailedPrices)}
                          >Load</button></td>
                      }
                      <td>{item.duplicateId ? "" : "Not dupe"}</td>
                      <td>
                        {fmt.format(
                          Math.floor(
                            prices[item.definitionId] * 0.95 - item.discardValue
                          )
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
