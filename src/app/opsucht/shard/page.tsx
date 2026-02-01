'use client'

import React, { useState, useEffect } from 'react';

const Page = () => {
    const [rates, setRates] = useState({});
    const [marketPrices, setMarketPrices] = useState({});
    const [amountDiamond, setAmountDiamond] = useState(0);
    const [amountNetherite, setAmountNetherite] = useState(0);
    const [bankShards, setBankShards] = useState(0);

    // Shard-Kurse
    useEffect(() => {
        fetch('https://api.opsucht.net/merchant/rates')
            .then(res => res.json())
            .then(data => {
                const rateObj = {};
                data.forEach(item => rateObj[item.source] = item.exchangeRate);
                setRates(rateObj);
            })
            .catch(console.error);
    }, []);

    // Marktpreise (Buy & Sell)
    useEffect(() => {
        const fetchPrice = async (item) => {
            try {
                const res = await fetch(`https://api.opsucht.net/market/price/${item}`);
                const data = await res.json();
                const orders = Object.values(data)[0];
                const buy = orders.find(o => o.orderSide === 'BUY')?.price || 0;
                const sell = orders.find(o => o.orderSide === 'SELL')?.price || 0;
                return { buy, sell };
            } catch {
                return { buy: 0, sell: 0 };
            }
        };

        const loadPrices = async () => {
            const diamond = await fetchPrice('diamond_block');
            const netherite = await fetchPrice('netherite_ingot');
            setMarketPrices({ diamond_block: diamond, netherite_ingot: netherite });
        };

        loadPrices();
    }, []);

    // BankShards aus SessionStorage laden
    useEffect(() => {
        const storedShards = sessionStorage.getItem('bankShards');
        if (storedShards) setBankShards(Number(storedShards));
    }, []);

    // BankShards speichern
    useEffect(() => {
        sessionStorage.setItem('bankShards', bankShards);
    }, [bankShards]);

    const calculate = (amount, item) => {
        const rate = rates[item] || 0;
        const shards = amount * rate;
        const priceBuy = rate > 0 ? (shards / rate) * (marketPrices[item]?.buy || 0) : 0;
        const priceSell = rate > 0 ? (shards / rate) * (marketPrices[item]?.sell || 0) : 0;
        return { shards, priceBuy, priceSell };
    };

    const diamond = calculate(amountDiamond, 'diamond_block');
    const netherite = calculate(amountNetherite, 'netherite_ingot');

    const totalShardsAfterBuy = bankShards + diamond.shards + netherite.shards;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Shard Rechner + Bank</h1>

            <div style={styles.row}>
                {/* Diamond Block */}
                <div style={styles.card}>
                    <h2>Diamond Block</h2>
                    <p>Kurs: {rates['diamond_block']?.toFixed(2) || '...'} Shards</p>
                    <input
                        type="number"
                        placeholder="Menge Diamanten"
                        value={amountDiamond}
                        onChange={(e) => setAmountDiamond(Number(e.target.value))}
                        style={styles.input}
                    />
                    <p style={{ color: '#8ab4ff' }}>Shards aus Diamond: {diamond.shards.toFixed(2)}</p>
                    <p style={{ color: 'red' }}>Kaufpreis: {formatMoney(diamond.priceBuy)} Dias</p>
                    <p style={{ color: 'lightgreen' }}>Verkaufspreis: {formatMoney(diamond.priceSell)} Dias</p>
                </div>

                {/* Netherite Ingot */}
                <div style={styles.card}>
                    <h2>Netherite Ingot</h2>
                    <p>Kurs: {rates['netherite_ingot']?.toFixed(2) || '...'} Shards</p>
                    <input
                        type="number"
                        placeholder="Menge Netherite"
                        value={amountNetherite}
                        onChange={(e) => setAmountNetherite(Number(e.target.value))}
                        style={styles.input}
                    />
                    <p style={{ color: '#8ab4ff' }}>Shards aus Netherite: {netherite.shards.toFixed(2)}</p>
                    <p style={{ color: 'red' }}>Kaufpreis: {formatMoney(netherite.priceBuy)} Dias</p>
                    <p style={{ color: 'lightgreen' }}>Verkaufspreis: {formatMoney(netherite.priceSell)} Dias</p>
                </div>

                {/* Bank */}
                <div style={styles.card}>
                    <h2>Bank</h2>
                    <p>Aktuelle Shards:</p>
                    <input
                        type="number"
                        value={bankShards}
                        onChange={(e) => setBankShards(Number(e.target.value))}
                        style={styles.input}
                    />
                    <p style={{ color: '#8ab4ff', marginTop: '10px' }}>
                        Gesamt Shards nach Items: {formatMoney(totalShardsAfterBuy.toFixed(2))}
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '30px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
    },
    title: { marginBottom: '20px', textAlign: 'center' },
    row: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    card: {
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        width: '250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        textAlign: 'center',
    },
    input: {
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #666',
        backgroundColor: '#222',
        color: 'white',
        textAlign: 'center',
    },
};

const formatMoney = (money) => {
    money = Number(money);
    if (money < 1000) return money.toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (money < 1000000) return (money / 1000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "K";
    if (money < 1000000000) return (money / 1000000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "M";
    return (money / 1000000000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "Mrd";
};

export default Page;
