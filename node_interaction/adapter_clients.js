/*
 * service adapter proxy
 * */
const service_request = require("request"), // HTTP client
    cluster = require("cluster"), // access to cluster.worker.id
    cfg = require("../config/config"),
    c = cfg.color;

// get cluster worker ID
let wid = cluster.worker.id;
if (wid === 1) {
    console.log("WID: ", wid);
    let { btc_rates } = cfg.services;
    console.log("btc_rates from LTC", btc_rates("/all?from=LTC"));
    console.log("btc_rates from LTC to BTC", btc_rates("?from=BTC&to=LTC"));
}
