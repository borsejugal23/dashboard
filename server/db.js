const mongoose = require("mongoose");

const connection = mongoose.connect(process.env.mongooseURL);

module.exports = { connection };
