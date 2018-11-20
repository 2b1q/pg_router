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
- pgr_stack
    - pgw_node (payment gateway node.js router)
    - pgw_mongo (pgw data store)
    - pgw_mongo-express (pgw UI db management console)
- nodes
    - BTC
    - LTC
- services
    - btc_rates
    - btc_adapter
    - ltc_adapter
    - profile_listener
### PGR Prerequisites
- [Node.js](https://nodejs.org/) v8+ to run.
- config.js 
- docker
### Install and Run PGR
1. `cp config-example.js config.js`
2. edit config.js (setup env properties)
3. run (docker-compose -f stack.yml up -d)
```sh
$ git clone https://2b1q@bitbucket.org/bankexlab/payment-gateway-router.git
$ cd payment-gateway-router
$ docker-compose -f stack.yml up -d
```
## Usage
### new PGR user REST request
Lets create a new PGR user
```sh
$ curl -s 'http://localhost:3006/api/v1/user' -X POST -H "Content-Type:application/json" --user myNewUser:myNewPassword -d '{}'
{"msg":"new user created successfully","error":null,"reg_services":["btc","ltc"],"logins":["btc@myNewUser","ltc@myNewUser"]}
```
Ok! Lets try with **BTC**
```sh
$ curl -s 'http://localhost:3006/'  --data-binary $'{\n "jsonrpc": "1.0",\n "method": "getdifficulty",\n "params": []\n}' --user btc@myNewUser:myNewPassword |jq 
{
  "result": 7184404942701.792,
  "error": null,
  "id": null
}
```
Lets try with **LTC**
```sh
$ curl -s 'http://localhost:3006/'  --data-binary $'{\n "jsonrpc": "1.0",\n "method": "getdifficulty",\n "params": []\n}' --user ltc@myNewUser:myNewPassword |jq 
{
  "result": 8068443.399989726,
  "error": null,
  "id": null
}
```
Lets try ask rates from LTC
use *user_name:user_password* to GET response from service.
service proxying request pattern: *<pgw>/api/v1/<service_name>/enpoint?param1=val1*
```sh
$ curl -s 'http://localhost:3006/api/v1/btc/rates/all?from=LTC' -X GET  --user 123:www -d '{}'|jq
{
  "msg": "authorized",
  "serviceUrl": "http://137.117.110.27:8100/api/v1/rates/all?from=LTC",
  "result": {
    "statusCode": 200,
    "statusMessage": "OK",
    "body": {
      "BKX": 0.0010352083318428426,
      "BTC": 137.76605258451082,
      "ETH": 4.074107196088952,
      "LTC": 1,
      "USD": 0.029809813390568176
    }
  }
}
```
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
### Demo proxying BTC/LTC services & JSON-RPC to BCT/LTC nodes
![](pgw_all.gif)
### Demo service proxying request
![](pgw_rates.gif)
### Demo init stack 
![](pgw.gif)

