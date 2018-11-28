const cfg = require("../../../config/config"),
    moment = require("moment"),
    { color: c, api_version: API_VERSION, store } = cfg,
    { redis: redis_cfg, channel } = store,
    { id: wid } = require("cluster").worker; // access to cluster.worker.id

// current module
const _module_ = "JSON-RPC-proxy";
// worker id pattern
const wid_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.red}[RPC]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${endpoint}] ${c.white}`;
// response container
let response;

/** simple RPC behavior */
const redisRpc = require('node-redis-rpc');
const rpc = new redisRpc(redis_cfg);
const node_rpc_channel = 'node_rpc:'+wid;
// redis RPC callback for JSON-RPC messaging
const rpc_callback = (err, data ) => {
    if(err) {
        console.error(`Worker: [${wid}]" error:\n`, err);
        return response.json(err)
    }
    console.log(`Worker: [${wid}]. Module: 'MAIN' RPC Data>>>\n`, data);
    response.json(data)
};

/* Trigger an event on the channel "node_rpc:<wid>"
 *  arg1 - channel
 *  arg2 - msg data JSON
 *  arg3 - options + cb (register a callback handler to be executed when the rpc result returns)
 * */
exports.emit = payload =>  rpc.emit(node_rpc_channel, { payload: payload },
    {
        type: 'rpc',            // trigger an event of type "rpc"
        callback:  rpc_callback // register a callback handler to be executed when the rpc result returns
    }
)
exports.setRes = res => response = res;
