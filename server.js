const express = require('express');
const app = express();
const cors = require("cors");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");

const PORT = 4000;
const mongoose = require("mongoose");
require("dotenv").config();

//データベース接続
mongoose
    .connect(process.env.MONGOURL)
    .then(() =>{
    console.log("DB接続中");
    }).catch((err) => {
        console.log(err);
    });

//ミドルウェア
app.use(express.json());
app.use(cors());
app.use("/api/users",userRoute);
app.use("/api/auth",authRoute);

app.listen(PORT,() => console.log("サーバーが起動しました"));