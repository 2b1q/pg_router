# payment-gateway-router [PGR]
- Common entry point to interact with **BTL/LTC** nodes and services
    - [transparent node proxying] *JSON-RPC* interaction with **BTL/LTC** node 
    - [service routing] REST service routing
- Request balancing and routing by client *HTTP headers* and *virtual user_name*
    - reg one user and get virtual users to interact with all node types 
    - use <node_type>@<user_name> pattern to query routing
    - use JSON-RPC to interact with **BTL/LTC** nodes
    - use REST to service requests
- User management 
    - [REST API] Create PGR user
    - [REST API] List user services
    - [REST API] Service request authentication
    - [JSON-RPC] Node request authentication
### PGR components
### PGR Prerequisites
- [Node.js](https://nodejs.org/) v8+ to run.
- config.js 
- docker
### Usage
![](pgw.gif)
### Install and Run PGR
1. `cp config-example.js config.js`
2. edit config.js (setup env properties)
3. run docker-composer stack
```sh
$ git clone https://2b1q@bitbucket.org/bankexlab/payment-gateway-router.git
$ cd payment-gateway-router
$ docker-compose -f stack.yml up -d
```
### new PGW user REST request
Lets create a new PGW user
 
### LTC/BTC JSON-RPC request
Use basic cURL json-rpc request to get data from node
node json-rpc request pattern:
`curl -s 'http://pgw_host:pgw_port/'  --data-binary $'{\n "jsonrpc": "1.0",\n "method": "node method",\n "params": []\n}' --user <node_type>@<user_name>:<user_password>`
LTC node json-rpc request:
```sh
$ curl -s 'http://localhost:3006/'  --data-binary $'{\n "jsonrpc": "1.0",\n "method": "getdifficulty",\n "params": []\n}' --user ltc@user7777:www
{"result":8068443.399989726,"error":null,"id":null}
```
BTC node json-rpc request:
```sh
$ curl -s 'http://localhost:3006/'  --data-binary $'{\n "jsonrpc": "1.0",\n "method": "getdifficulty",\n "params": []\n}' --user btc@user7777:www
{"result":7184404942701.792,"error":null,"id":null} 
```
HTTP header 'content-type' could be any -H 'content-type: text/plain;' OR -H 'Content-Type: application/json'
