const app        = require('express')()
const port       = process.env.port || 8080
const aplicativo = require('./app.js')
const database   = require('./config/database');
const mongoose   = require('mongoose');

mongoose.connect(database.mongolab.url);

aplicativo.MonitorarNotificacoes()
aplicativo.RemoverNotificacoes()


app.listen(port, (err) => {
    if (err) console.error(err)

    console.log('Open on ' + port)
})