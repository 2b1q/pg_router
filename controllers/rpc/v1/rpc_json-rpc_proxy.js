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
const wid_err_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.red}[RPC]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]
${c.red}[ERROR] ${endpoint}] ${c.white}`;

// response container
let response = Object.create(null);
/** simple RPC behavior constructor */
const redisRpc = require('node-redis-rpc');
const rpc = new redisRpc(redis_cfg);
const node_rpc_channel = channel.jrpc('master'); // connect to master channel
const rpc_timeout = 1000;
const rpc_timeout_err = `RPC service ${node_rpc_channel} request timeout occurred`;
// redis RPC callback for JSON-RPC messaging
const rpc_callback = (err, data ) => {
    if(err) {
        console.log(wid_err_ptrn(err));
        return response.json(err)
    }
    console.log(wid_ptrn(`get callback from service ${node_rpc_channel}`), '\n',data);
    response.json(data);
    response = null; // clear response object
};
// request timeout error callback
const reqTimeout = () =>{
    setTimeout(()=>{
        if(response) {
            console.log(wid_err_ptrn(rpc_timeout_err));
            response.json({ err: rpc_timeout_err });
            response = null; // clear response
        }
    }, rpc_timeout)
};

/* Trigger an event on the channel "node_rpc:<wid>"
 *  arg1 - channel
 *  arg2 - msg data JSON
 *  arg3 - options + cb (register a callback handler to be executed when the rpc result returns)
 * */
exports.emit = (payload) =>  {
    console.log(wid_ptrn(`send payload to service ${node_rpc_channel}`),'\n',payload);
    rpc.emit(node_rpc_channel, { payload: payload },
        {
            type: 'rpc',            // trigger an event of type "rpc"
            callback:  rpc_callback // register a callback handler to be executed when the rpc result returns
    });
    reqTimeout(); // reg Error callback timeout
};
exports.setRes = res => response = res;
