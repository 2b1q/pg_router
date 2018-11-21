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
    console.log("btc_rates ", btc_rates(""));
}

/*
* proxy URL constructor
* request execution
* */
exports.get = ({ adapter, endpoint, param_string: params }) =>
    new Promise(async (resolve, reject) => {
        // URL constructor
        let { btc_rates, btc_adapter, ltc_adapter } = cfg.services;
        let url; // url container
        // redirect to help URL
        if (endpoint === "help") {
            if (adapter === "btc") url = btc_adapter(endpoint);
            if (adapter === "ltc") url = ltc_adapter(endpoint);
            if (adapter === "rates") url = btc_rates(endpoint);
            else url = btc_adapter(endpoint); // default helper => btc_adapter helper
            return resolve(url);
        }
        // if endpoint include 'rates' ('api/v1/[btc,ltc]/rates/all?from=BKX') => construct btc_rates(endpoint)
        url = /rates*/.test(endpoint) ? btc_rates(endpoint) : undefined;
        // if adapter = rates ('/api/v1/rates/all?from=BKX') => construct btc_rates(adapter)
        if (typeof url == "undefined") {
            url = adapter === "rates" ? btc_rates(adapter) : undefined;
            if (endpoint) url += "/" + endpoint;
        }
        // otherwise construct normal services (btc OR ltc) adapter
        if (typeof url == "undefined") url = adapter === "btc" ? btc_adapter(endpoint) : ltc_adapter(endpoint);
        url = typeof params == "undefined" ? url : url + "?" + params;
        try {
            var result = await adapterRequest(url);
        } catch (e) {
            console.error(`Error on adapterRequest(${url})\n`, e);
        }
        resolve({
            result: result,
            url: url,
            redirect: false
        });
    });

/*
* service adapter requester
* */
const adapterRequest = url =>
    new Promise((resolve, reject) =>
        service_request(url, { json: true }, (err, res, body) => {
            if (err) return reject(err);
            console.log(`adapterRequest(${url})\n`, {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                body: body
            });
            resolve({
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                body: body
            });
        })
    );
