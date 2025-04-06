const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./database.db');

// Получение всех дней с дежурными и резервами
app.get('/api/duty', (req, res) => {
    db.all('SELECT date, attendants, reserves FROM duty', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        const duties = rows.map(row => ({
            date: row.date,
            attendants: JSON.parse(row.attendants || '[]'),
            reserves: JSON.parse(row.reserves || '[]')
        }));

        res.json(duties);
    });
});

// Добавление/удаление дежурного
app.patch('/api/duty/:date', (req, res) => {
    const date = req.params.date;
    const { operation, userId } = req.body;

    if (!operation || !userId) {
        return res.status(400).json({ error: 'Необходимы operation и userId' });
    }

    if (operation !== 'add' && operation !== 'remove') {
        return res.status(400).json({ error: 'Недопустимая операция' });
    }

    db.get('SELECT attendants, reserves FROM duty WHERE date = ?', [date], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        let attendants = [];
        let reserves = [];

        if (row) {
            try {
                attendants = JSON.parse(row.attendants || '[]');
                reserves = JSON.parse(row.reserves || '[]');
            } catch (e) {
                return res.status(500).json({ error: 'Ошибка данных дежурных или резервов' });
            }
        }

        if (operation === 'add') {
            // Если пользователь находится в запасе, удаляем его оттуда
            if (reserves.includes(userId)) {
                reserves = reserves.filter(id => id !== userId);
            }
            if (!attendants.includes(userId)) {
                attendants.push(userId);
            }
        } else {
            attendants = attendants.filter(id => id !== userId);
        }

        const attendantsStr = JSON.stringify(attendants);
        const reservesStr = JSON.stringify(reserves);

        if (row) {
            db.run(
                'UPDATE duty SET attendants = ?, reserves = ? WHERE date = ?',
                [attendantsStr, reservesStr, date],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка обновления дежурства' });
                    }
                    res.json({ success: true, attendants, reserves });
                }
            );
        } else {
            if (operation === 'remove') {
                return res.status(404).json({ error: 'Дата не найдена' });
            }
            db.run(
                'INSERT INTO duty (date, attendants, reserves) VALUES (?, ?, ?)',
                [date, attendantsStr, reservesStr],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка создания дежурства' });
                    }
                    res.json({ success: true, attendants, reserves });
                }
            );
        }
    });
});

// Добавление/удаление резерва
app.patch('/api/duty/:date/reserve', (req, res) => {
    const date = req.params.date;
    const { operation, userId } = req.body;

    if (!operation || !userId) {
        return res.status(400).json({ error: 'Необходимы operation и userId' });
    }

    if (operation !== 'add' && operation !== 'remove') {
        return res.status(400).json({ error: 'Недопустимая операция' });
    }

    db.get('SELECT attendants, reserves FROM duty WHERE date = ?', [date], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        let attendants = [];
        let reserves = [];

        if (row) {
            try {
                attendants = JSON.parse(row.attendants || '[]');
                reserves = JSON.parse(row.reserves || '[]');
            } catch (e) {
                return res.status(500).json({ error: 'Ошибка данных дежурных или резервов' });
            }
        }

        if (operation === 'add') {
            // Если пользователь находится в дежурных, удаляем его оттуда
            if (attendants.includes(userId)) {
                attendants = attendants.filter(id => id !== userId);
            }
            if (!reserves.includes(userId)) {
                reserves.push(userId);
            }
        } else {
            reserves = reserves.filter(id => id !== userId);
        }

        const attendantsStr = JSON.stringify(attendants);
        const reservesStr = JSON.stringify(reserves);

        if (row) {
            db.run(
                'UPDATE duty SET attendants = ?, reserves = ? WHERE date = ?',
                [attendantsStr, reservesStr, date],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка обновления резерва' });
                    }
                    res.json({ success: true, attendants, reserves });
                }
            );
        } else {
            if (operation === 'remove') {
                return res.status(404).json({ error: 'Дата не найдена' });
            }
            db.run(
                'INSERT INTO duty (date, attendants, reserves) VALUES (?, ?, ?)',
                [date, attendantsStr, reservesStr],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка создания резерва' });
                    }
                    res.json({ success: true, attendants, reserves });
                }
            );
        }
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
