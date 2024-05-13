const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path")

const app = express();
const db = new sqlite3.Database("memorygame.db");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..','public')))


db.serialize(() => {
    db.run(
        "CREATE TABLE IF NOT EXISTS scores(id INTEGER PRIMARY KEY AUTOINCREMENT,player TEXT,score INTERGER,datetime TEXT)"
    );
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..','public', 'index.html'));
});

app.get("/scores", (req,res) => {
    db.all("SELECT * FROM scores ORDER BY datetime DESC", [], (err,rows) => {
        if(err) {
            res.status(500).send("Erro ao obter pontuações");
        } else {
            res.status(200).json(rows)
        }
    })
})

app.post("/save-score", (req,res) => {
    const {player, score, datetime} = req.body;
    db.run(
        "INSERT INTO scores (player, score, datatime) VALUES (?,?,?)",
        [player,score,datetime],
        function (err) {
            if(err) {
                res.status(500).send("Erro ao salvar pontuação");
            } else {
                res.status(200).send("Pontuação salva com sucesso");
            }
        }
    );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})