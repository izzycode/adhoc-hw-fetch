import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const PRIMARY_COLORS = ["red", "yellow", "blue"];
const OPEN_DISPOSITION = "open";
const CLOSED_DISPOSITION = "closed";
const PER_PAGE = 10;
const HTTP_OK = 200;

let currentPage;

const retrieve = (opts = {}) => {
  const { page = 1, colors = [] } = opts;

  currentPage = page;

  // helpers, mostly for legibility
  const getIds = (records) => {
    return records.map(rec => rec.id);
  }
  const prevPageNum = () => {
    return (currentPage > 1) ? currentPage - 1 : null;
  }
  const nextPageNum = (allRecords) => {
    return (allRecords.length - PER_PAGE > 0) ? currentPage + 1 : null;
  }
  const isClosed = record => record.disposition == CLOSED_DISPOSITION;
  const isOpen = record => record.disposition == OPEN_DISPOSITION;
  const isPrimary = record => PRIMARY_COLORS.includes(record.color);

  return fetch(
    URI(window.path).search({
        "offset": (page - 1) * PER_PAGE,
        "color[]": colors
    })
  )
  .then(
    response => {
      if (response.status == HTTP_OK)
        return response.json()
      return Promise.reject(response);
    },
    error => console.log("Network Error.")
  )
  .then(
    allRecords => {
      const records = allRecords.slice(0, PER_PAGE);
      return {
        "previousPage": prevPageNum(),
        "nextPage": nextPageNum(allRecords),
        "ids": getIds(records),
        "open": records.filter(isOpen).map(rec => ({ ...rec,
          isPrimary: isPrimary(rec)
        })),
        "closedPrimaryCount": records.reduce((count, rec) => {
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


// var output = {
//   "previousPage":null,
//   "nextPage":2,
//   "ids":[1,2,3,4,5,6,7,8,9,10],
//   "open":[
//     {"id":2,"color":"yellow","disposition":"open","isPrimary":true},
//     {"id":4,"color":"brown","disposition":"open","isPrimary":false},
//     {"id":6,"color":"blue","disposition":"open","isPrimary":true},
//     {"id":8,"color":"green","disposition":"open","isPrimary":false},
//     {"id":10,"color":"red","disposition":"open","isPrimary":true}
//   ],
//   "closedPrimaryCount":1
// };

// I. construct a URL from opts using `URI`:
// 1. address `page` opt w `offset` of 10 per page
// 2. address `colors` array, adding `color[]` terms to query

// returns next page -- either from existing cache,
// or from a fresh API request -- wrapped in a Promise.
// function recordsPage(opts) {
//   // const page = (opts.page > 1) ? opts.page : 1;
//   const offset = (opts.page - 1) * PER_PAGE;
//
//
//   return fetch(
//     URI(window.path).search({
//         "offset": offset,
//         "color[]": opts.colors
//     })
//   )
// }

// const cache = {
//   records: [],
//   pages: () => {
//     return this.records.reduce((pages, record) => {
//       let pageNum = (record.id - 1) / PER_PAGE;
//       return (Number.isInteger(pageNum)) ? pages.concat([pageNum]) : pages;
//     },[]);
//   }
// };
