// @ts-ignore
import fetch from 'node-fetch';

async function saveExpiredAuctions() {
    try {
        const res = await fetch('http://localhost:3000/api/save-expired-auctions', {
            method: 'POST'
        });
        const data = await res.json();
        // @ts-ignore
        console.log(`Abgelaufene Auktionen gespeichert: ${data.saved}`);
    } catch (err) {
        console.error('Scheduler Fehler:', err);
    }
}

setInterval(saveExpiredAuctions, 10000);
