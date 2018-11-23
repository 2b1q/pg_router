/*
 * service adapter proxy
 * */
const service_request = require("request"), // HTTP client
    { id: wid } = require("cluster").worker, // access to cluster.worker.id
    cfg = require("../../config/config"),
    c = cfg.color;

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
    new Promise(async resolve => {
        console.log(c.yellow, { adapter, endpoint, params }, c.white);
        // URL constructor
        let { btc_rates, btc_adapter, ltc_adapter } = cfg.services;
        let url; // url container
        if (adapter === "btc") url = endpoint ? btc_adapter(endpoint) : btc_adapter("");
        if (adapter === "ltc") url = endpoint ? ltc_adapter(endpoint) : ltc_adapter("");
        if (adapter === "rates") url = endpoint ? btc_rates(adapter + "/" + endpoint) : btc_rates(adapter); // if service adapter = rates
        if (/rates*/.test(endpoint)) url = btc_rates(endpoint); // if rates in endpoint PATH
        // redirect to help URL
        if (endpoint === "help") {
            if (adapter === "rates") return resolve(btc_rates(endpoint)); // rebuild URL if adapter === "rates"
            return resolve(url);
        }
        // add params if exists
        if (params) url += "?" + params;
        console.log(c.cyan, url, c.white);
        try {
            var result = await adapterRequest(url);
        } catch (e) {
            console.error(`Error on adapterRequest(${url})\n`, e);
        }
        resolve({
            result: result,
            url: url
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
