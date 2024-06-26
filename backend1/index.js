const express = require('express')
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const server = require("http").Server(app)
const db = require("./src/app/db/database")
const routes = require("./routes");
const cors = require('cors');
const port = process.env.PORT || 8000;
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

app.get('/', function (req, res) {
    return res.status(200).send("Welcome to School Management")
});

routes.map(route => {
    app.use(route.path, route.handler);
});

server.listen(port, () => {
    console.log(`Server started at  ${port}, Database -schoolMangement`);
});

