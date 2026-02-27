require("./config/db");
const express = require("express");
const mariadb = require("mariadb");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "redAyuda"
});
const usuariosRoutes = require("./routes/usuariosRoutes");
app.use("/api", usuariosRoutes);

app.post("/register", async (req, res) => {
    const { nombre, apellido, correo, contraseña } = req.body;

    try {
        const conn = await pool.getConnection();
        const hash = await bcrypt.hash(contraseña, 10);

        await conn.query(
            "INSERT INTO usuarios(nombre, apellido, correo, contraseña) VALUES (?, ?, ?, ?)",
            [nombre, apellido, correo, hash]
        );

        conn.release();
        res.json({ mensaje: "Usuario registrado" });

    } catch (err) {
        res.json({ error: "Error al registrar" });
    }
});

app.post("/login", async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);

        if (rows.length === 0) return res.json({ error: "Usuario no existe" });

        const valido = await bcrypt.compare(contraseña, rows[0].contraseña);

        if (!valido) return res.json({ error: "Contraseña incorrecta" });

        res.json({ mensaje: "Login exitoso" });

    } catch (err) {
        res.json({ error: "Error en login" });
    }
});

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));