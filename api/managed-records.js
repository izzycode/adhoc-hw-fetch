import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// constants
const PRIMARY_COLORS = ["red", "yellow", "blue"];
const OPEN_DISPOSITION = "open";
const CLOSED_DISPOSITION = "closed";
const HTTP_OK = 200;
const PER_PAGE = 10;

/**
 * Retrieves raw data from the /records/ API endpoint and returns a
 * page of transformed records, wrapped in a Promise.
 *
 * @param {Object}  opts         Optional. An object of options for records.
 * @param {Array}   opts.colors  Optional. Filter records by one or more colors:
 *                               "red", "brown", "blue", "yellow", or "green"
 * @param {Integer} opts.page    Optional, defaults to 1. The page to return.
 */
function retrieve(opts = {}) {
  const { page = 1, colors = [] } = opts;

  // helpers, mostly for legibility
  const getIds = (records) => {
    return records.map(record => record.id);
  }
  const prevPageNum = () => {
    return (page > 1) ? page - 1 : null;
  }
  const nextPageNum = (records) => {
    return ((records.length - PER_PAGE) > 0) ? page + 1 : null;
  }
  const isClosed = record => record.disposition == CLOSED_DISPOSITION;
  const isOpen = record => record.disposition == OPEN_DISPOSITION;
  const isPrimary = record => PRIMARY_COLORS.includes(record.color);

  return fetch( // make the request
    URI(window.path).search({
        "offset": (page - 1) * PER_PAGE,
        "color[]": colors
    })
  )
  .then( // handle the HTTP response
    response => {
      if (response.status == HTTP_OK)
        return response.json();
      return Promise.reject(response);
    },
    error => {
      console.log("A network error occurred!");
      return [];
    }
  )
  .then( // transform and return the page of records
    records => {
      const recsForPage = records.slice(0, PER_PAGE);
      return {
        "previousPage": prevPageNum(),
        "nextPage": nextPageNum(records),
        "ids": getIds(recsForPage),
        "open": recsForPage.filter(isOpen).map(rec => ({ ...rec,
          isPrimary: isPrimary(rec)
        })),
        "closedPrimaryCount": recsForPage.reduce((count, rec) => {
          return (isClosed(rec) && isPrimary(rec)) ? count + 1 : count;
        }, 0)
      };
    },
    errorResp => {
      console.log("HTTP Error:", errorResp.status, errorResp.statusText);
    }
  )
}

export default retrieve;
