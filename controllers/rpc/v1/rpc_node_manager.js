// todo add RPC interaction with NM service-model

const cfg = require("../../../config/config"),
    moment = require("moment"),
    { project, color: c, api_version: API_VERSION, store } = cfg,
    { redis: redis_cfg, channel } = store,
    rpc = require("../../../modules/rpc"), // RPC wrapper
    { id: wid } = require("cluster").worker; // access to cluster.worker.id

// current module
const _module_ = "node manager controller";
// worker id pattern
const wid_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${endpoint}] ${c.white}`;
const wid_err_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]
${c.red}[ERROR] ${endpoint}] ${c.white}`;
// simple query logger
let logit = (req, msg = "") =>
    Object({
        msg: msg,
        api_version: API_VERSION,
        module: "AUTH API controller",
        project: project,
        post_params: req.body,
        get_params: req.query,
        url_pathL: req.url,
        timestamp: (() => moment())(),
        path: module.filename
            .split("/")
            .slice(-2)
            .join("/")
    });
// error object constructor
const error = (errCode, msg) => Object({ errCode, msg });

// setup RPC channel
const node_rpc_channel = channel.nm("master"); // connect to master channel
// init RPC channel
rpc.init(node_rpc_channel);
// emit controller pass payload to rpc model
exports.emit = payload => {
    console.log(wid_ptrn("emit payload"));
    rpc.emit(node_rpc_channel, payload);
};

/*
 * common RPC message wrapper
 * arg 1 - response object
 * arg 2 - RPC payload
 * arg 3 - executor method
 * */
const rpcWrapper = (res, payload, method) => {
    // set res object to RPC module (need on RPC timeout)
    rpc.setRes(res);
    /*
     * RPC emitter
     * arg1 - channel
     * arg2 - payload
     * arg3 - callback
     *  */
    rpc.emit(node_rpc_channel, payload, (err, data) => {
        console.log(wid_ptrn(`\ngot RPC callback \nfrom ${node_rpc_channel} channel\nmethod => ${method}\n`));
        rpc.setRes(null); // clear res object
        if (err) return res.json(error(400, err));
        console.log(data);
        let { msg: response } = data;
        res.json(response);
    });
};

/**
 * getBestNode type CFG
 * */
exports.getBestNode = type =>
    new Promise(async (resolve, reject) => {
        console.log(wid_ptrn(`getBestNode ${type}`));
        // emit RPC to AUTH service => 'auth' method
        console.log(wid_ptrn("emit payload"));
        let payload = {
            method: "getBestNode",
            to: "checker",
            params: {
                node_type: type
            }
        };
        /*
         * RPC emitter
         * arg1 - channel
         * arg2 - payload
         * arg3 - callback
         *  */
        rpc.emit(node_rpc_channel, payload, (err, data) => {
            console.log(wid_ptrn(`\ngot RPC callback \nfrom ${node_rpc_channel} channel\nmethod 'getBestNode\n`));
            rpc.setRes(null); // clear res object
            if (err) return reject(err);
            console.log(data);
            let { msg: config } = data; // get config
            resolve(config);
        });
    });

/*
 *  check API_KEY for node management requests
 * */
const chekApiKey = ({ api_key }) => api_key === process.env.mgmt_api_key && process.env.mgmt_api_key !== undefined;

/*
 * get all nodes
 * - check API_KEY
 * - send RPC MSG to pg_nm
 * - get RPC cb
 * - send response
 * */
exports.nodes = async (req, res) => {
    console.log(wid_ptrn("getNodes"));
    // emit RPC to NM service => 'list' method
    console.log(wid_ptrn("emit payload"));
    let type = "all";
    let payload = {
        method: "list",
        to: "checker",
        params: {
            node_type: type
        }
    };
    // check API_KEY
    if (chekApiKey(req.headers)) rpcWrapper(res, payload, `list node_type: ${type}`);
    else res.status(401).json(error(401, "Bad API_KEY"));
};

/*
 * get all nodes by Nodes type
 * - check API_KEY
 * - send RPC MSG to pg_nm
 * - get RPC cb
 * - send response
 * */
exports.nodesByType = async (req, res) => {
    let type = req.url.split("/").pop();
    console.log(wid_ptrn(`getNodesByType ${type}`));
    // emit RPC to NM service => 'list' method
    console.log(wid_ptrn("emit payload"));
    let payload = {
        method: "list",
        to: "checker",
        params: {
            node_type: type
        }
    };
    // check API_KEY
    if (chekApiKey(req.headers)) rpcWrapper(res, payload, `list node_type: ${type}`);
    else res.status(401).json(error(401, "Bad API_KEY"));
};

/*
 * get node by node hash or node id
 * - check API_KEY
 * - send RPC MSG to pg_nm
 * - get RPC cb
 * - send response
 * */
exports.nodeByHid = async (req, res) => {
    let { hid } = req.query;
    console.log(wid_ptrn(`getNodeByHid ${hid}`));
    // emit RPC to NM service => 'list' method
    console.log(wid_ptrn("emit payload"));
    let payload = {
        method: "get",
        to: "checker",
        params: {
            hid: hid
        }
    };
    // check API_KEY
    if (chekApiKey(req.headers)) rpcWrapper(res, payload, `get node_by_hid: ${hid}`);
    else res.status(401).json(error(401, "Bad API_KEY"));
};
/*
 * Legacy code
 * */

// debug node config
const nodes_ = { nodes: [] };

/*
 * add node
 * */
exports.addNode = async (req, res) => {
    console.log(wid_ptrn("addNode"));
    res.json(nodes_);
};

/*
 * update node
 * */
exports.updNode = async (req, res) => {
    console.log(wid_ptrn("updNode"));
    res.json(nodes_);
};

/*
 * remove node
 * */
exports.remNode = async (req, res) => {
    console.log(wid_ptrn("remNode"));
    res.json(nodes_);
};
