const node = require("../../../modules/node_management/interface"),
    cfg = require("../../../config/config"),
    { color: c, api_version: API_VERSION, nodes } = cfg,
    { id: wid } = require("cluster").worker; // access to cluster.worker.id

// current module
const _module_ = "Node manager controller";
// worker id pattern
const wid_ptrn = msg =>
    `${c.green}worker[${wid}]${c.red}[AUTH]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${msg}] ${c.white}`;

/*
*  todo check creds before manage node
* */
const chekCreds = req => {};

// debug
const nodes_ = {};
Object.keys(nodes).forEach(type => {
    if (!nodes_[type]) nodes_[type] = [];
    nodes_[type].push(nodes[type]);
});

/*
* get all nodes
* */
exports.getNodes = async (req, res) => {
    console.log(wid_ptrn("getNodes"));
    res.json(nodes_);
};

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
