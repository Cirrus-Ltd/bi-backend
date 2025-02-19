const router = require('express').Router();

const User = require('../models/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const nodemailer = require("nodemailer");
const saltRounds = 10;

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const token = crypto.randomBytes(16).toString("hex");

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            confirmationToken: token,
            isVerified: false
        });

        await sendConfirmationEmail(req.body.email, token);

        const user = await newUser.save();
        return res.status(200).json({ message: "Confirmation email sent", user: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.get("/confirm-email", async (req, res) => {
    try {
        const { token } = req.query; // クエリパラメータからtokenを取得

        const user = await User.findOne({ confirmationToken: token });
        if (!user) return res.status(400).send("無効なトークンです。");

        // 秘密鍵を生成
        const newSecretKey = crypto.randomBytes(32).toString('hex');

        user.isVerified = true; // アカウントを認証済みに設定
        user.secretKey = newSecretKey; // 生成した秘密鍵をユーザーに保存
        await user.save();

        return res.status(200).send("アカウントが認証されました。");
    } catch (err) {
        res.status(500).json(err);
    }
});


router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("ユーザーが見つかりません");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("パスワードが違います");

        if (!user.secretKey) {
            return res.status(500).send("サーバー内部エラー: ユーザーの秘密鍵が見つかりません");
        }

        // JWTの署名
        const token = await signJWT(user, { userId: user._id });

        // ユーザー情報からpasswordと他の不要なフィールドを除外
        const { password, secretKey, confirmationToken, createdAt , updatedAt, ...userResponse } = user.toObject();

        return res.status(200).json({ user: userResponse, token });  // トークンも応答として返します
    } catch (err) {
        res.status(500).json(err);
    }
});


async function sendConfirmationEmail(email, token) {
    const transporter = nodemailer.createTransport({
        service: "Gmail", 
        auth: {
            user: "broadcast@f-cirrus.co.jp",
            pass: process.env.MAILPASS
        }
    });

    const link = `https://ap.f-cirrus.co.jp/v1/auth/confirm-email?token=${token}`;

    const mailOptions = {
        from: "cirrus-broadcast@f-cirrus.co.jp",
        to: email,
        subject: "メールアドレスの確認",
        text: "次のリンクをクリックして、アカウントを認証してください。: " + link
    };

    await transporter.sendMail(mailOptions);
}


async function signJWT(user, payload) {
    const secret = user.secretKey;
    if (!secret) {
        throw new Error("No secret key found for the given user.");
    }
    return jwt.sign(payload, secret);
}

async function verifyJWT(user, token) {
    const secret = user.secretKey;
    if (!secret) {
        throw new Error("No secret key found for the given user.");
    }
    return jwt.verify(token, secret);
}

module.exports = router;