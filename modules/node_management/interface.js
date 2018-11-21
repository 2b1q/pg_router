const cfg = require("../../config/config"),
    { color: c, api_version: API_VERSION } = cfg,
    { id: wid } = require("cluster").worker, // access to cluster.worker.id
    db = require("../../libs/db"),
    nodes_col = "nodes";

// current module
const _module_ = "Interface module";
// worker id pattern
const wid_ptrn = msg =>
    `${c.green}worker[${wid}]${c.red}[AUTH]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${msg}] ${c.white}`;

/*
* Bootstrap node DB config from scratch config
* */
db.get()
    .then(db_instance => {
        if (!db_instance) return console.error(wid_ptrn("No db instance!"));
        db_instance
            .collection(nodes_col)
            .findOne({})
            .then(nodes => {
                console.log(`${c.green}Nodes ${c.magenta}`, nodes, c.white);
            })
            .catch(e => console.error("Mongo error on Bootstrap node: ", e));
    })
    .catch(() => console.error(wid_ptrn("connection to MongoDB lost")));

/*
* get best BTC node
* */
const getBtcNode = () => new Promise(resolve, reject => {});

/*
 * get best LTC node
 * */
const getLtcNode = () => new Promise(resolve, reject => {});

/*
* add node to DB
* type String ['btc','ltc']
* config (full node config)
* */
const addNode = (type, config) => new Promise(resolve, reject => {});
