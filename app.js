const express = require('express')
const enableWs = require('express-ws');
const ws = require('./ws')();
const { convertValue } = require('./utils');

const app = express();
enableWs(app);

app.ws('/ws', ws.handler);

app.get('/:id/:pin', async (req, res) => {
    const { id, pin } = req.params;
    const { format } = req.query;
    if (!id || +pin < 0) {
        return res.json({ error: 'WrongParams' }).end()
    }
    let value;
    try {
        value = await ws.getValue(id, +pin);
    } catch (error) {
        return res.json({ error }).end();
    }
    res.json({ value: convertValue(value, format) }).end();
});

app.get('/:id/:pin/:value', (req, res) => {
    const { id, pin, value } = req.params;
    if (!id || +pin < 0) {
        return res.json({ error: 'WrongParams' }).end()
    }
    try {
        ws.send(id, { op: 'set', pin: +pin, value });
        res.json({}).end();
    } catch (error) {
        res.json({ error }).end()
    }
});

app.listen(9700, () => console.log("Server started"));