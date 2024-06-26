const mongoose = require("mongoose");
const env = require("../../environment/enviroment");

class Database {
    constructor() {
        this.db_connect();
    }
    async db_connect() {
        try {
            // mongoose.set('useFindAndModify', false);
            // mongoose.set('useCreateIndex', true);
            // mongoose.set('useUnifiedTopology', true);
            this.database = await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
            });
            console.log("Database connection successful");
            mongoose.set('debug', true);

        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = new Database();