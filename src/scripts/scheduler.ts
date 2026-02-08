// @ts-ignore
import fetch from 'node-fetch';

async function saveExpiredAuctions() {
    try {
        const res = await fetch('http://localhost:3000/api/save-expired-auctions', {
            method: 'POST'
        });
    } catch (err) {
        console.error('Scheduler Fehler:', err);
    }
}

setInterval(saveExpiredAuctions, 10000);
