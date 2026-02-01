'use client';
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Area
} from 'recharts';
import './MarketClient.css';

// ---------------- TYPES ----------------
// Repräsentiert eine einzelne Order im Markt
type Order = { orderSide: 'BUY' | 'SELL'; activeOrders: number; price: number };
// Repräsentiert einen Artikel im Markt mit allen Orders
type MarketItem = { opsuchtName: string; orders: Order[] };
// Struktur für alle Markt-Daten nach Kategorie und Item
type MarketData = Record<string, Record<string, MarketItem>>;
// Ein Datenpunkt für den Preis-Chart (beste Buy/Sell Preise pro Tag)
type DailyPricePoint = { timestamp: string; bestBuy: number; bestSell: number };

// ---------------- PRICE CHART COMPONENT ----------------
type PriceChartProps = { material: string; onClose: () => void };
type PriceChartState = { data: DailyPricePoint[] | null; loading: boolean; error: string | null };

export class PriceChart extends React.Component<PriceChartProps, PriceChartState> {
    constructor(props: PriceChartProps) {
        super(props);
        this.state = { data: null, loading: true, error: null };
    }

    // Daten beim Mounten laden
    componentDidMount() {
        this.fetchDailyData();
    }

    // API-Aufruf, um die letzten 6 Tage der Preis-History zu laden
    async fetchDailyData() {
        try {
            const res = await fetch(`https://api.opsucht.net/market/history/${this.props.material}`);
            if (!res.ok) throw new Error('Fehler beim Laden der Preis-History');

            const raw = await res.json();
            if (!raw.DAILY || !Array.isArray(raw.DAILY)) throw new Error('Keine Daten verfügbar');

            const last6 = raw.DAILY.slice(-6);

            // Daten in Format für Recharts umwandeln
            const data: DailyPricePoint[] = last6.map((day: any) => ({
                timestamp: day.timestamp,
                bestBuy: Number(day.maxPrice),    // Best Buy (ROT im Chart)
                bestSell: Number(day.avgPrice),   // Best Sell (GRÜN im Chart)
            }));

            this.setState({ data });
        } catch (err: any) {
            this.setState({ error: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { onClose, material } = this.props;
        const { data, loading, error } = this.state;

        // Bild-URL für das Item
        const imageUrl = `https://img.mc-api.io/${material.toLowerCase()}.png`;

        // Datum für X-Achse formatieren
        const formatDate = (t: string) => {
            const d = new Date(t);
            return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
        };

        // @ts-ignore
        return (
            <div className="modal-overlay">
                <div className="modal-content">

                    {/* ---------------- HEADER ---------------- */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <img
                            src={imageUrl}
                            alt={material}
                            style={{ width: '64px', height: '64px', marginRight: '1rem', borderRadius: '8px' }}
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64?text=?')}
                        />
                        <h2 style={{ color: '#fff', margin: 0, textTransform: 'capitalize' }}>{material}</h2>
                        <button
                            onClick={onClose}
                            style={{
                                marginLeft: 'auto',
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            X
                        </button>
                    </div>

                    {/* ---------------- CHART ---------------- */}
                    {loading && <p style={{ color: '#fff', textAlign: 'center' }}>Lade...</p>}
                    {error && <p style={{ color: '#fff', textAlign: 'center' }}>Fehler: {error}</p>}

                    {data && data.length > 0 && (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 30 }}>
                                {/* Gitternetz */}
                                <CartesianGrid stroke="#444" strokeDasharray="5 5" />
                                {/* X-Achse */}
                                <XAxis dataKey="timestamp" stroke="#fff" tickFormatter={formatDate} />
                                {/* Y-Achse */}
                                <YAxis stroke="#fff" tickFormatter={(v) => v.toFixed(2)} />
                                {/* Tooltip */}
                                <Tooltip
                                    formatter={(
                                        value: string | number,
                                        name: string,
                                        item: any,
                                        index: number,
                                        payload: readonly { value: string | number; name: string }[]
                                    ) => {
                                        // Value formatieren
                                        const formattedValue =
                                            typeof value === 'number' ? value.toFixed(2) : value ?? '-';

                                        // Name ggf. anpassen
                                        const formattedName = name ? name.toUpperCase() : '';

                                        // Als Array zurückgeben: [value, name]
                                        return [formattedValue, formattedName];
                                    }}
                                    labelFormatter={(label: React.ReactNode) => {
                                        if (typeof label !== 'string') return label;
                                        const d = new Date(label);
                                        return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
                                    }}
                                    contentStyle={{
                                        backgroundColor: '#1f1f1f',
                                        border: '1px solid #4f46e5',
                                        fontSize: '0.9rem',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                    }}
                                />






                                {/* ---------------- Gradient Areas ---------------- */}
                                <defs>
                                    <linearGradient id="gradBuy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.4} />   {/* ROT */}
                                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="gradSell" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.4} />   {/* GRÜN */}
                                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>

                                {/* Hintergrund-Flächen */}
                                <Area
                                    dataKey="bestBuy"
                                    fill="url(#gradBuy)"
                                    stroke="none"
                                    tooltipType="none"
                                />

                                <Area
                                    dataKey="bestSell"
                                    fill="url(#gradSell)"
                                    stroke="none"
                                    tooltipType="none"
                                />


                                {/* ---------------- LINIEN ---------------- */}
                                <Line
                                    type="monotone"
                                    dataKey="bestBuy"
                                    stroke="#dc2626"           // Linie ROT
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: '#ffffff', stroke: 'none' }}
                                    activeDot={{ r: 8, fill: '#dc2626', stroke: 'none' }} // Punkt ROT
                                    name="Best Buy"
                                    style={{ filter: 'drop-shadow(0 0 6px #dc2626)' }}   // Shadow ROT
                                />

                                <Line
                                    type="monotone"
                                    dataKey="bestSell"
                                    stroke="#16a34a"           // Linie GRÜN
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: '#ffffff', stroke: 'none' }}
                                    activeDot={{ r: 8, fill: '#16a34a', stroke: 'none' }} // Punkt GRÜN
                                    name="Best Sell"
                                    style={{ filter: 'drop-shadow(0 0 6px #16a34a)' }}   // Shadow GRÜN
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}

                    {/* Keine Daten verfügbar */}
                    {!loading && (!data || data.length === 0) && (
                        <p style={{ color: '#fff', textAlign: 'center' }}>Keine Daten verfügbar</p>
                    )}
                </div>
            </div>
        );
    }
}

// ---------------- MARKET CLIENT COMPONENT ----------------
type MarketState = {
    marketData: MarketData | null;
    loading: boolean;
    error: string | null;
    selectedItem: string | null;
    activeCategory: string | null;
};

export default class MarketClient extends React.Component<{}, MarketState> {
    constructor(props: {}) {
        super(props);
        this.state = { marketData: null, loading: true, error: null, selectedItem: null, activeCategory: null };
    }

    componentDidMount() {
        this.fetchMarketData();
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    // ---------------- API CALL ----------------
    async fetchMarketData() {
        try {
            const res = await fetch('https://api.opsucht.net/market/prices');
            if (!res.ok) throw new Error('Fehler beim Laden der Marktdaten');

            const raw = await res.json();
            const formatted: MarketData = {};

            // Rohdaten in internes Format umwandeln
            Object.keys(raw).forEach(cat => {
                formatted[cat] = {};
                Object.keys(raw[cat]).forEach(item => {
                    formatted[cat][item] = { opsuchtName: item.replace(/_/g, ' '), orders: raw[cat][item] };
                });
            });

            this.setState({ marketData: formatted });
        } catch (err: any) {
            this.setState({ error: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    // Liefert den besten Buy/Sell Preis für ein Item
    getBestPrice(orders: Order[], side: 'BUY' | 'SELL'): number | null {
        const filtered = orders.filter(o => o.orderSide === side);
        if (!filtered.length) return null;
        return side === 'BUY'
            ? Math.max(...filtered.map(o => o.price))
            : Math.min(...filtered.map(o => o.price));
    }

    // Scroll zu Kategorie
    scrollToCategory = (cat: string) => {
        const el = document.getElementById(cat);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll-Event, um aktive Kategorie zu setzen
    handleScroll = () => {
        if (!this.state.marketData) return;
        const cats = Object.keys(this.state.marketData);
        for (let c of cats) {
            const el = document.getElementById(c);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    if (this.state.activeCategory !== c) this.setState({ activeCategory: c });
                    break;
                }
            }
        }
    };

    render() {
        const { marketData, loading, error, selectedItem, activeCategory } = this.state;
        if (loading) return <p className="loading-text">Lade Marktdaten...</p>;
        if (error) return <p className="loading-text">Fehler: {error}</p>;
        if (!marketData) return <p className="loading-text">Keine Daten verfügbar</p>;

        const categories = Object.keys(marketData);

        return (
            <div className="market-container">
                <h2 className="market-title">OPSUCHT Market</h2>

                {/* ---------------- TABS ---------------- */}
                <div className="market-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`market-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => this.scrollToCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ---------------- MARKET GRID ---------------- */}
                {categories.map(cat => (
                    <div key={cat} id={cat} className="market-category">
                        <h3 className="category-title">{cat}</h3>
                        <div className="market-grid">
                            {Object.keys(marketData[cat]).map(itemKey => {
                                const item = marketData[cat][itemKey];
                                const bestBuy = this.getBestPrice(item.orders, 'BUY');
                                const bestSell = this.getBestPrice(item.orders, 'SELL');
                                const imgUrl = `https://img.mc-api.io/${itemKey.toLowerCase()}.png`;

                                return (
                                    <div
                                        key={itemKey}
                                        className="market-card"
                                        onClick={() => this.setState({ selectedItem: itemKey.toLowerCase() })}
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={item.opsuchtName}
                                            className="market-item-img"
                                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64?text=?')}
                                        />
                                        <h4 className="item-name" title={item.opsuchtName}>
                                            {item.opsuchtName}
                                        </h4>
                                        <p className="buy-price">Best Buy: {formatMoney(bestBuy) ?? '–'}</p>
                                        <p className="sell-price">Best Sell: {formatMoney(bestSell) ?? '–'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* ---------------- PRICE CHART MODAL ---------------- */}
                {selectedItem && <PriceChart material={selectedItem} onClose={() => this.setState({ selectedItem: null })} />}
            </div>
        );
    }
}

// ---------------- HELPER ----------------
// Formatierung von Geldbeträgen
const formatMoney = (money: number | null) => {
    if (money === null) return null;
    if (money < 1000) return money.toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (money < 1000000) return (money / 1000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "K";
    if (money < 1000000000) return (money / 1000000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "M";
    return (money / 1000000000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "Mrd";
};
