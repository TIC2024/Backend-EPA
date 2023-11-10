const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'contratos'
});

db.connect(function(error) {
    if (error) {
        throw error;
    } else {
        console.log("Conexion Exitosa");
    }
});

// RUTAS
app.post('/api/authenticate', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?"; // ¡Considera cifrar las contraseñas!

    db.query(sql, [username, password], (error, results) => {
        if (error) {
            throw error;
        }
        if (results.length > 0) {
            res.json({ authenticated: true });
        } else {
            res.json({ authenticated: false });
        }
    });
});

app.get('/api/contratos', (req, res) => {
    const sql = `
    SELECT  
        c.tpcontrato,
        d.idconsecutivo, 
        d.fechaingreso, 
        d.fechainicio, 
        d.fechatermina, 
        d.fechaactualizacion, 
        d.objeto, 
        d.novedades, 
        c.tpcontrato,
        e.estado
    FROM dtcontratos d
    JOIN contrato c ON d.idcontrato = c.idcontrato
    JOIN estadocontrato e ON d.estado = e.idestado`;

    db.query(sql, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.sqlMessage });
            return;
        }
        res.json(results);
    });
});

app.post('/api/register', (req, res) => {
    // Desestructura las propiedades directamente con los nombres de las columnas de tu tabla
    const { fechaIngreso, idconsecutivo, objeto, fechainicio, fechatermina, novedades, idcontrato, idestado } = req.body;

    const sql = `
      INSERT INTO dtcontratos (
        fechaingreso, 
        idconsecutivo, 
        objeto, 
        fechainicio, 
        fechatermina, 
        novedades, 
        idcontrato, 
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [fechaIngreso, idconsecutivo, objeto, fechainicio, fechatermina, novedades, idcontrato, idestado], (error, results) => {
        if (error) {
            console.error(error);
            res.json({ success: false, message: error.sqlMessage });
            return;
        }
        res.json({ success: true, data: results });
    });
});

// Obtener los estados de los contratos
app.get('/api/estados', (req, res) => {
    const sql = 'SELECT idestado, estado FROM estadocontrato'; // Asegúrate de que 'estados' es el nombre correcto de tu tabla
    db.query(sql, (error, results) => {
        if (error) {
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results);
    });
});

// Obtener los tipos de contrato
app.get('/api/tiposcontrato', (req, res) => {
    const sql = 'SELECT idcontrato, tpcontrato FROM contrato'; // Asegúrate de que 'tipos_contrato' es el nombre correcto de tu tabla
    db.query(sql, (error, results) => {
        if (error) {
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results);
    });
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});