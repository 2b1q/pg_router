const cfg = require("../../config/config"),
    crypto = require("crypto"),
    { color: c, api_version: API_VERSION, nodes: nodes_from_file } = cfg,
    { id: wid } = require("cluster").worker, // access to cluster.worker.id
    db = require("../../libs/db"),
    nodes_col = "nodes";

// current module
const _module_ = "Interface module";
// worker id pattern
const wid_ptrn = msg =>
    `${c.green}worker[${wid}]${c.red}[node manager]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${msg}] ${
        c.white
    }`;
// bootstrap node config
const bootstrapped_nodes = {};
Object.keys(nodes_from_file).forEach(type => {
    if (!bootstrapped_nodes[type + "_nodes"]) bootstrapped_nodes[type + "_nodes"] = [];
    bootstrapped_nodes[type + "_nodes"].push({
        type: type,
        status: "bootstrapping...",
        nodeHash: "",
        lastBlock: 0,
        updateTime: new Date(), // UTC
        config: nodes_from_file[type]
    });
});

/*
* Bootstrap node DB config from scratch config on start (on module require) wid=1
* 1. get node config from DB
*  OK => return
*  FAIL => insert nodes from config
* 2.
* */
wid === 1 &&
    db
        .get()
        .then(db_instance => {
            console.log(wid_ptrn("Bootstrapping..."));
            if (!db_instance) return console.error(wid_ptrn("No db instance!"));
            db_instance
                .collection(nodes_col)
                .findOne({})
                .then(nodes => {
                    // if nodes === null => addNodes(bootstrapped_nodes)
                    if (!nodes)
                        addNodes(bootstrapped_nodes)
                            .then(node_hashes => console.log("Successfully inserted nodes: ", node_hashes))
                            .catch(e => console.error("Error while inserting nodes on bootstrap:\n", e));
                })
                .catch(e => console.error("Mongo error on bootstrapping nodes: ", e));
        })
        .catch(() => console.error(wid_ptrn("connection to MongoDB lost")));

/*
* get best BTC node
* */
const getBtcNode = () => new Promise((resolve, reject) => {});

/*
 * get best LTC node
 * */
const getLtcNode = () => new Promise((resolve, reject) => {});

/*
* Get all nodes from DB
* */
const getNodes = () => new Promise((resolve, reject) => {});

/*
* add node Object to DB
* */
const addNode = node =>
    new Promise((resolve, reject) => {
        // hash nodeObject
        const nodeHash = crypto
            .createHmac("sha256", "(@)_(@)")
            .update(JSON.stringify(node.config))
            .digest("hex");
        console.log(wid_ptrn("addNode"), `\nnode_type "${node.type}"\nnode_status: "${node.status}"\nnode_hash: "${nodeHash}"`);
        node.nodeHash = nodeHash; // add node hash property
        node.updateTime = new Date(); // update dateTime (UTC)
        // insert node
        return db
            .get()
            .then(db_instance => {
                if (!db_instance) return console.error(wid_ptrn("No db instance!"));
                db_instance
                    .collection(nodes_col)
                    .updateOne({ nodeHash: nodeHash }, { $set: { ...node } }, { upsert: true })
                    .then(data => {
                        console.log(`Inserting new ${c.magenta}${node.type}${c.green} OK${c.white}`);
                        resolve(nodeHash);
                    })
                    .catch(e => reject(e));
            })
            .catch(() => console.error(wid_ptrn("connection to MongoDB lost")));
    });

/*
 * add nodes to DB
 * */
const addNodes = async nodes => {
    // get all node types
    let node_types_list = Object.keys(nodes);
    let insert_promise_list = [];
    // construct Promise list
    node_types_list.forEach(node_type => nodes[node_type].forEach(node => insert_promise_list.push(addNode(node))));
    return await Promise.all(node_types_list)
        .then(node_list => node_list)
        .catch(e => e);
};
