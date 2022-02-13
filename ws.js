const useWs = () => {

    const getListeners = {};
    const clients = {};

    const handleMessage = (ws, json) => {
        const msg = JSON.parse(json);
        const { op } = msg;
        console.log('Received ', msg);
        if (op === 'register') {
            ws.id = msg.id;
            clients[ws.id] = ws;
            console.log('Registered id', ws.id);
        }
        if (op === 'reply') {
            for (const listener of getListeners[ws.id]?.[msg.pin + ''] || []) {
                listener(msg.value);
            }
        }
    };

    const handler = (ws, req) => {
        ws.on('message', msg => handleMessage(ws, msg));
        ws.on('close', () => {
            console.log('WebSocket was closed');
            if (ws.id) {
                delete clients[ws.id];
                console.log('Dropped', ws.id);
            }
        });
    };

    const send = (id, msg) => {
        const client = clients[id];
        if (!client) {
            throw 'NoClient';
        }
        client.send(JSON.stringify(msg));
    };

    const getValue = (id, pin) => new Promise((resolve, reject) => {
        const client = clients[id];
        if (!client) {
            reject('NoClient');
            return;
        }
        getListeners[id] = getListeners[id] || [];
        getListeners[id][pin] = getListeners[id][pin] || [];
        const timeout = setTimeout(() => {
            removeListener();
            reject('Timeout');
        }, 10000);
        const listener = value => {
            removeListener();
            clearTimeout(timeout);
            resolve(value);
        };
        const removeListener = () => getListeners[id][pin].splice(getListeners[id][pin].indexOf(listener), 1);
        getListeners[id][pin].push(listener);
        send(id, { op: 'get', pin });
    });

    return {
        handler,
        getValue,
        send
    }
}

module.exports = useWs;