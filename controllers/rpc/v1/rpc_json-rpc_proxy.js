const cfg = require("../../../config/config"),
    rpc = require("../../../modules/rpc"),
    moment = require("moment"),
    { color: c, api_version: API_VERSION, store } = cfg,
    { redis: redis_cfg, channel } = store,
    { id: wid } = require("cluster").worker; // access to cluster.worker.id

// current module
const _module_ = "JSON-RPC-proxy controller";
// worker id pattern
const wid_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${endpoint}] ${c.white}`;
const wid_err_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]
${c.red}[ERROR] ${endpoint}] ${c.white}`;

// setup RPC channel
const node_rpc_channel = channel.jrpc("master"); // connect to master channel
// init RPC channel
rpc.init(node_rpc_channel);
// emit controller pass payload to rpc model
exports.emit = (payload, res) => {
    console.log(wid_ptrn("emit payload"));
    rpc.emit(node_rpc_channel, payload, (err, data) => {
        if (err) {
            console.log(wid_err_ptrn(err));
            return res.json({ error: err, result: null, id: null });
        }
        console.log(wid_ptrn(`\ngot RPC callback \nfrom ${node_rpc_channel} channel\nmethod '${payload.method}`), "\n", data);
        let { msg: response } = data;
        res.json(response);
    });
};
// exports.setRes = res => rpc.setRes(res);
