import { useEffect, useState } from "react";
import "./App.css";
import ThemePicker from "./ThemePicker";
import UiScaleControl from "./UiScaleControl";
import RatingRange from "./RatingRange";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft,
  faBan,
  faCloudArrowDown,
  faPersonWalkingArrowLoopLeft,
} from "@fortawesome/free-solid-svg-icons";
import Toggle from "./Toggle";

const TRANSFERS_MODE = "Transfers";
const CLUB_MODE = "Club";

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  if ((seconds / 31536000) > 1) return Math.floor(seconds / 31536000) + " years ago";
  if ((seconds / 2592000) > 1) return Math.floor(seconds / 2592000) + " months ago";
  if ((seconds / 86400) > 1) return Math.floor(seconds / 86400) + " days ago";
  if ((seconds / 3600) > 1) return Math.floor(seconds / 3600) + " hours ago";
  if ((seconds / 60) > 1) return Math.floor(seconds / 60) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

function imgsrc(id) {
  return `https://www.ea.com/fifa/ultimate-team/web-app/content/22747632-e3df-4904-b3f6-bb0035736505/2022/fut/items/images/mobile/portraits/${id}.png`;
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

function sort_items_club(a, b) {
  if (!(a._rating == b._rating)) {
    return b._rating - a._rating;
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
    case 12:
      return `Icon`;
    case 22:
      return `Trailblaizers`;
    case 25:
      return `PremiumSbc`;
    case 28:
      return `TripleThreat`;
    case 31:
      return `WUCL`;
    case 33:
      return `Thunderstruck`;
    case 34:
      return `FcPro`;
    case 37:
      return `Radioactive`;
    case 43:
      return `PLPotm`;
    case 46:
      return `EuropaRttk`;
    case 50:
      return `UclRttk`;
    case 51:
      return `Flashback`;
    case 52:
      return `Sudamericana`;
    case 53:
      return `Libertadores`;
    case 68:
      return `UclTotgs`;
    case 72:
      return `Hero`;
    case 80:
      return `FcProUpgrade`;
    case 81:
      return `Exclusive`;
    case 82:
      return `TripleThreatHero`;
    case 85:
      return `DynastiesIcon`;
    case 87:
      return `SquadFoundations`;
    case 91:
      return `Objectives`;
    case 95:
      return `Dynasties`;
    case 105:
      return `ConferenceLeague`;
    case 114:
      return `PotmSerieA`;
    case 123:
      return `Euro`;
    case 150:
      return `DynamicDuos`;
    case 151:
      return `Centurions`;
    case 168:
      return `CenturionsIcon`;
    case 171:
      return `UefaHeroesMan`;
    case 182:
      return `Nike`;
    default: {
      console.log(
        `Item version unmmaped: ${item._rareflag} | ${item._staticData?.firstName} ${item._staticData?.lastName} (${item._rating})`,
        item
      );
      return "Unknown";
    }
  }
}

const fmt = new Intl.NumberFormat();

async function fetchPrices(items, setPrices) {
  const BUCKET_SIZE = 50;

  const rids = items
    .filter((item) => item.type === "player")
    .sort(sort_items_club)
    .map((player) => player.definitionId);

  const bucketsNeeded = Math.ceil(items.length / BUCKET_SIZE);
  const allPrices = {};

  for (let bucket = 0; bucket < bucketsNeeded; bucket++) {
    const i = bucket * BUCKET_SIZE;
    const partialRids = rids.slice(i, i + BUCKET_SIZE).join(",");
    if (partialRids) {
      await new Promise((resolve) => setTimeout(resolve, 25 * bucket));

      const result = await fetch(
        `https://www.fut.gg/api/fut/player-prices/25/?ids=${partialRids}`
      ).then((r) => r.json());

      console.log("Fetched prices from fut.gg: ", result);

      for (const price of result.data) {
        if (price.eaId == 0) continue;
        allPrices[`${price.eaId}`] = price;
      }

      setPrices({ ...allPrices });
    }
  }

  setPrices({ ...allPrices });
}

async function fetchDetailedPrice(
  id,
  previousDetailedPrices,
  setDetailedPrices
) {
  const result = await fetch(
    `https://www.futbin.com/25/playerPrices?player=${id}&rids=`
  ).then((r) => r.json());

  previousDetailedPrices[id] = (result || {})[id]?.prices?.ps;
  setDetailedPrices({ ...previousDetailedPrices });
}

function fontAwesomeDisabled(disabled) {
  return disabled ? "Disabled" : "";
}

function App() {
  const [loading, setLoading] = useState("Application is starting...");
  const [transfersListItems, setTransfersListItems] = useState([]);
  const [clubItems, setClubItems] = useState([]);
  const [prices, setPrices] = useState({});
  const [detailedPrices, setDetailedPrices] = useState({});
  const [nameFilter, setNameFilter] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState(47);
  const [maxRatingFilter, setMaxRatingFilter] = useState(99);
  const [currentTheme, setTheme] = useState("Dark");
  const [mode, setMode] = useState(TRANSFERS_MODE);
  const [hideLoans, setHideLoans] = useState(true);
  const [hideTradeable, setHideTradeable] = useState(false);
  const [hideUntradeable, setHideUntradeable] = useState(false);
  const [uiScale, setUiScale] = useState(5);

  const setThemeWithPersistance = (theme) => {
    setTheme(theme);
    chrome.storage.local.set({ theme });
  };
  const setUiScaleWithPersistance = (uiScale) => {
    setUiScale(uiScale);
    chrome.storage.local.set({ uiScale });
  };

  function filter_item(item) {
    function filter_name(item) {
      if (!item._nameMatchString) {
        item._nameMatchString = (JSON.stringify(item._staticData) || "")
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

    function filter_loan(item) {
      return !hideLoans || item.loans < 0;
    }

    function filter_tradeable(item) {
      return !hideTradeable || item.untradeable == true;
    }

    function filter_untradeable(item) {
      return !hideUntradeable || item.untradeable == false;
    }

    return (
      filter_name(item) &&
      filter_rating(item) &&
      filter_loan(item) &&
      filter_tradeable(item) &&
      filter_untradeable(item)
    );
  }

  useEffect(() => {
    (async function () {
      chrome.storage.local.get(
        ["clubItems", "data", "theme", "uiScale"],
        function ({ clubItems, data, theme, uiScale }) {
          console.log({ clubItems, data });
          const filteredTransfersListItems = Object.values(
            data.transfersList || []
          ).filter((item) => item.type === "player");
          const filteredClubItems = Object.values(clubItems | []).filter(
            (item) => item.type === "player"
          );
          setTransfersListItems(filteredTransfersListItems);
          setClubItems(filteredClubItems);

          fetchPrices(
            [...filteredTransfersListItems, ...filteredClubItems],
            setPrices
          );
          setLoading(false);
          theme && setTheme(theme);
          uiScale && setUiScale(uiScale);
          window._transfersList = transfersListItems;
          console.log({ transfersList });
        }
      );
    })();
  }, []);

  window.FutTransfersList = { items: transfersListItems };
  console.log({ transfersListItems });

  return (
    <div className={"App " + currentTheme}>
      {loading ? (
        <h1>{loading}</h1>
      ) : (
        <>
          <header class="Controls">
            <div className="ControlGroup">
              <div className="ControlGroup">
                <input
                  className="PlayerSearch"
                  type="text"
                  placeholder="Filter players"
                  onChange={(e) => setNameFilter(e.target.value.toLowerCase())}
                />
              </div>
              <div className="ControlGroup">
                <RatingRange
                  minRating={minRatingFilter}
                  setMinRating={setMinRatingFilter}
                  maxRating={maxRatingFilter}
                  setMaxRating={setMaxRatingFilter}
                />
              </div>
              <div className="ControlGroup">
                <UiScaleControl
                  uiScale={uiScale}
                  setUiScale={setUiScaleWithPersistance}
                />
                <ThemePicker
                  currentTheme={currentTheme}
                  setTheme={setThemeWithPersistance}
                />
              </div>
            </div>
            <div className="ControlGroup">
              <Toggle
                values={[TRANSFERS_MODE, CLUB_MODE]}
                callback={setMode}
                initialState={0}
                label={"Transfers List / Club"}
              />
              <Toggle
                values={[false, true]}
                callback={setHideLoans}
                initialState={1}
                label={"Hide Loans"}
              />
              <Toggle
                values={[false, true]}
                callback={setHideTradeable}
                initialState={0}
                label={"Hide Tradeable"}
              />
              <Toggle
                values={[false, true]}
                callback={setHideUntradeable}
                initialState={0}
                label={"Hide Untradeable"}
              />
            </div>
          </header>
          <div class="Content">
            <table style={{ "--table-height": `${uiScale}vh` }}>
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th className="Left">Name</th>
                  <th>Price</th>
                  <th>Price Range</th>
                  <th>Last Update</th>
                  <th>More Prices</th>
                  <th>Quick Sell Loss</th>
                </tr>
              </thead>
              <tbody>
                {(mode === CLUB_MODE ? clubItems : transfersListItems)
                  .filter(filter_item)

                  .sort(mode === CLUB_MODE ? sort_items_club : sort_items)
                  .map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          className={`PlayerPortrait Rating ${rarity(
                            item
                          )} ${bronzeSilverGold(item)}`}
                          src={`https://cdn.futbin.com/content/fifa25/img/players/${item._metaData?.id}.png?v=23`}
                          onError={(e) => {
                            if (e.target.src == imgsrc(item._metaData?.id)) {
                              console.warn("No image for item: ", item);
                            } else {
                              //e.target.src = imgsrc(item._metaData?.id);
                            }
                          }}
                        />
                        {item.loans >= 0 && (
                          <span className="loan">{item.loans}</span>
                        )}
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
                      <td>
                        {mode === TRANSFERS_MODE && !item.duplicateId ? (
                          <FontAwesomeIcon
                            icon={faPersonWalkingArrowLoopLeft}
                          />
                        ) : mode === CLUB_MODE && item.untradeable ? (
                          <>
                            <FontAwesomeIcon icon={faArrowRightArrowLeft} />
                            <FontAwesomeIcon icon={faBan} />
                          </>
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="Left PlayerName">
                        {item?._staticData?.name || "<no name>"}
                      </td>
                      <td className="Right PlayerPrice">
                        <span className="CoinValue">
                          {prices[item.definitionId]
                            ? fmt.format(prices[item.definitionId]?.price)
                            : "?"}
                        </span>
                      </td>
                      <td>
                        <input
                          disabled
                          type="range"
                          max={item._itemPriceLimits?.maximum}
                          min={item._itemPriceLimits?.minimum}
                          value={prices[item.definitionId]?.price}
                        />
                      </td>
                      {detailedPrices[item.definitionId] != null ? (
                        <>
                          <td>
                            <span>
                              {detailedPrices[item.definitionId].updated}
                            </span>
                          </td>
                          <td className="LowestPrices">
                            <span className="CoinValue">
                              {detailedPrices[item.definitionId].LCPrice}
                            </span>
                            <span className="CoinValue">
                              {detailedPrices[item.definitionId].LCPrice2}
                            </span>
                            <span className="CoinValue">
                              {detailedPrices[item.definitionId].LCPrice3}
                            </span>
                            <span className="CoinValue">
                              {detailedPrices[item.definitionId].LCPrice4}
                            </span>
                            <span className="CoinValue">
                              {detailedPrices[item.definitionId].LCPrice5}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{timeSince(new Date(prices[item.definitionId]?.priceUpdatedAt))}</td>
                          <td>
                            <FontAwesomeIcon
                              className="FetchFutbinData"
                              icon={faCloudArrowDown}
                              onClick={(e) =>
                                fetchDetailedPrice(
                                  item.definitionId,
                                  detailedPrices,
                                  setDetailedPrices
                                )
                              }
                            />
                          </td>
                        </>
                      )}
                      <td>
                        <span className="CoinValue">
                          {fmt.format(
                            Math.floor(
                              prices[item.definitionId]?.price * 0.95 -
                                item.discardValue
                            )
                          )}
                        </span>
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
