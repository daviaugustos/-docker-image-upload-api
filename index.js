require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const pg = require("pg");
const aws = require("aws-sdk");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configuração do Sequelize (ajuste conforme sua configuração)
const sequelize = new Sequelize(
  "meu_banco_de_dados",
  "meu_usuario",
  "minha_senha",
  {
    host: "db", // O mesmo nome do serviço do banco de dados no docker-compose.yml
    dialect: "postgres",
    dialectModule: pg,
  }
);

// Importa o modelo
const Acesso = require("./models/Acesso")(sequelize, DataTypes);

// Sincroniza o modelo com o banco de dados e cria a tabela se não existir
sequelize.sync();

app.get("/", async (req, res) => {
  // Cria um novo registro de acesso
  await Acesso.create({});

  // Conta o total de acessos
  const totalAcessos = await Acesso.count();

  res.send(`Olá, Mundo! Acessos: ${totalAcessos}`);
});

// Configuração do AWS S3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

app.post("/upload", async (req, res) => {
  const base64Image = req.body.image;
  const buffer = Buffer.from(base64Image, "base64");
  const fileName = crypto.randomBytes(16).toString("hex") + ".jpg";

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: "image/jpeg",
  };

  try {
    const uploadResponse = await s3.upload(params).promise();
    res.json({ imageUrl: uploadResponse.Location });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao fazer upload da imagem");
  }
});

app.listen(3000, () => {
  console.log("Aplicação rodando na porta 3000");
});
