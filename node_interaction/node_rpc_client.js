const cfg = require("../config/config"),
    {
        // nodes: { btc, ltc },
        nodes,
        api_version: API_VERSION,
        project,
        color: c
    } = cfg,
    moment = require("moment"),
    { Client } = require("bitcoin"),
    { api_requests: log_api, error: log_err } = require("../utils/logger")(module);

// const ltc_client = new Client(ltc);
// const btc_client = new Client(btc);
// let _nodes = []; // node client collector
let empty = Object({ result: null, error: null, id: null });

// simple query logger
let logit = (req, msg = "") =>
    Object({
        msg: msg,
        api_version: API_VERSION,
        module: "address controller",
        project: project,
        req_headers: req.headers,
        post_params: req.body,
        get_params: req.query,
        timestamp: (() => moment())(), // UTC timestamp
        path: module.filename
            .split("/")
            .slice(-2)
            .join("/")
    });

/** common node request wrapper*/
const nodeRequester = async (user, pass, method, params) => {
    let _nodes = []; // node client collector
    /** node clients instantiation */
    if (_nodes.length === 0)
        for (let net in nodes) {
            let con = nodes[net];
            con.user = user;
            con.pass = pass;
            _nodes.push(new Client(con));
        }

    let p_list = _nodes.map(
        client =>
            new Promise(resolve => {
                client.cmd(method, (err, data) => {
                    if (err) return resolve({ result: null, error: err, id: null });
                    resolve({ result: data, error: null, id: null });
                });
            })
    );
    return await Promise.all(p_list)
        .then(data => {
            console.log(data);
            return data.map(res => {
                if (!res.error) return res;
                //(res.data ? res.data : empty)
            });
        })
        .catch(err => {
            console.error(err);
            return empty;
        });
};

// proxy client
exports.proxy = async (req, res) => {
    // log req params
    log_api(logit(req));
    let { method, params } = req.body;
    console.log("method: ", method);
    console.log("params: ", params);

    let user, pass;
    let { authorization } = req.headers;
    if (authorization) {
        let Authorization = authorization.split(" ");
        /** Base64 decoder*/
        if (Authorization[0] === "Basic") {
            let buff = new Buffer(Authorization[1], "base64");
            let text = buff.toString("ascii");
            let up = text.split(":");
            user = up[0]; // dispatch user
            pass = up[1]; // dispatch pass
        }
    }
    /** If AUTH Basic user */
    if (user && pass) {
        console.log(`${c.green}Get data for user: ${c.magenta}${user}${c.green}, pass: ${c.magenta}${pass}${c.white}`);
        let response = await nodeRequester(user, pass, method, params);
        let resp_payload = response.find(data => {
            if (data !== null) return data;
        });
        res.json(resp_payload ? resp_payload : empty);
    } else res.status(401).json({});

    // btc_client.cmd(method, (err, data) => {
    //     if (err) {
    //         response = { result: null, error: err, id: null };
    //         log_err(response);
    //         res.json(response);
    //         return console.error("response error", response);
    //     }
    //     response = { result: data, error: null, id: null };
    //     console.log("response", response);
    //     res.json(response);
    // });
};
