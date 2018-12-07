/*
 * RPC module
 * - RPC interaction with services [Auth, json-rpc-proxy, node-manager]
 * */
const cfg = require("../config/config"),
    { color: c, api_version: API_VERSION, store } = cfg,
    { redis: redis_cfg, channel } = store,
    { id: wid } = require("cluster").worker; // access to cluster.worker.id

// current module
const _module_ = "RPC interaction module";
// worker id pattern
const wid_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.red}[${_module_}]${c.yellow}[${API_VERSION}]${c.red} > ${c.green}[${endpoint}] ${c.white}`;
const wid_err_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.red}[${_module_}]${c.yellow}[${API_VERSION}]
${c.red}[ERROR] ${endpoint}] ${c.white}`;

// response container
let response = Object.create(null);
/** simple RPC behavior constructor */
const redisRpc = require("node-redis-rpc");
const rpc = new redisRpc(redis_cfg);
const rpc_timeout = 1000;
let node_rpc_channel;
let auth_channel;
let jrpc_channel;
let nm_channel;

const rpc_timeout_err = channel => `RPC service ${channel} request timeout occurred`;

// request timeout error callback
const reqTimeout = channel => {
    setTimeout(() => {
        if (response) {
            console.log(wid_err_ptrn(rpc_timeout_err(channel)));
            response.json({ err: rpc_timeout_err(channel) });
            response = null; // clear response
        }
    }, rpc_timeout);
};
// init rpc channels
exports.init = channel => {
    if (/jrpc:/.test(channel)) jrpc_channel = channel;
    if (/auth:/.test(channel)) auth_channel = channel;
    if (/nm:/.test(channel)) nm_channel = channel;
    node_rpc_channel = channel;
};
// set response object
exports.setRes = res => (response = res);
// exports RPC emitter
exports.emit = (channel, payload, cb) => {
    console.log(wid_ptrn(`send payload to service ${channel}`), "\n", payload);
    /* Trigger an event on the channel "node_rpc:<wid>"
     *  arg1 - channel
     *  arg2 - msg data JSON
     *  arg3 - options + cb (register a callback handler to be executed when the rpc result returns)
     * */
    rpc.emit(
        channel,
        { payload: payload },
        {
            type: "rpc", // trigger an event of type "rpc"
            callback: cb // register a callback handler to be executed when the rpc result returns
        }
    );
    reqTimeout(channel); // reg Error callback timeout
};
