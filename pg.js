const{Client, Pool} = require('pg')

var client = new Client({
    host: "ec2-50-17-231-192.compute-1.amazonaws.com",
    database: "dabt65gpdugk2i",
    port: 5432,
    password: "895dbc84efd9f3cccbf405cdad37d2dd906aaae8463c6149f9f19f47223d21a5",
    user: "dheskgvehxorgv"
})
// var client = new Client({
//     host: "local",
//     database: "upload",
//     port: 5432,
//     password: "123",
//     user: "postgres"
// })

client.connect();

module.exports = client;