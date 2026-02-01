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
type Order = { orderSide: 'BUY' | 'SELL'; activeOrders: number; price: number };
type MarketItem = { opsuchtName: string; orders: Order[] };
type MarketData = Record<string, Record<string, MarketItem>>;
type DailyPricePoint = { timestamp: string; bestBuy: number; bestSell: number };

// ---------------- PRICE CHART ----------------
type PriceChartProps = { material: string; onClose: () => void };
type PriceChartState = { data: DailyPricePoint[] | null; loading: boolean; error: string | null };

export class PriceChart extends React.Component<PriceChartProps, PriceChartState> {
    constructor(props: PriceChartProps) {
        super(props);
        this.state = { data: null, loading: true, error: null };
    }

    componentDidMount() {
        this.fetchDailyData();
    }

    async fetchDailyData() {
        try {
            const res = await fetch(`https://api.opsucht.net/market/history/${this.props.material}`);
            if (!res.ok) throw new Error('Fehler beim Laden der Preis-History');
            const raw = await res.json();

            if (!raw.DAILY || !Array.isArray(raw.DAILY)) throw new Error('Keine Daten verfügbar');

            const last6 = raw.DAILY.slice(-6);

            const data: DailyPricePoint[] = last6.map((day: any) => ({
                timestamp: day.timestamp,
                bestBuy: Number(day.avgPrice),    // Grün
                bestSell: Number(day.maxPrice),   // Rot
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
        const imageUrl = `https://img.mc-api.io/${material.toLowerCase()}.png`;

        const formatDate = (t: string) => {
            const d = new Date(t);
            return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
        };

        return (
            <div className="modal-overlay">
                <div
                    className="modal-content"
                    style={{
                        width: '100vw',
                        height: '100vh',
                        borderRadius: 0,
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#121212',
                    }}
                >
                    {/* Header */}
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

                    {/* Chart */}
                    {loading && <p style={{ color: '#fff', textAlign: 'center' }}>Lade...</p>}
                    {error && <p style={{ color: '#fff', textAlign: 'center' }}>Fehler: {error}</p>}

                    {data && data.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 30 }}>
                                <CartesianGrid stroke="#444" strokeDasharray="5 5" />
                                <XAxis dataKey="timestamp" stroke="#fff" tickFormatter={formatDate} />
                                <YAxis stroke="#fff" tickFormatter={(v) => v.toFixed(2)} />
                                <Tooltip
                                    formatter={(value: number) => value.toFixed(2)}
                                    labelFormatter={formatDate}
                                    contentStyle={{
                                        backgroundColor: '#1f1f1f',
                                        border: '1px solid #4f46e5',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                    }}
                                />

                                {/* Gradient Areas */}
                                <defs>
                                    <linearGradient id="gradBuy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="gradSell" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>

                                <Area type="monotone" dataKey="bestBuy" stroke={null} fill="url(#gradBuy)" />
                                <Area type="monotone" dataKey="bestSell" stroke={null} fill="url(#gradSell)" />

                                <Line
                                    type="monotone"
                                    dataKey="bestBuy"
                                    stroke="#16a34a"
                                    strokeWidth={3}
                                    dot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
                                    activeDot={{ r: 10 }}
                                    name="Best Buy"
                                    style={{ filter: 'drop-shadow(0 0 6px #16a34a)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="bestSell"
                                    stroke="#dc2626"
                                    strokeWidth={3}
                                    dot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
                                    activeDot={{ r: 10 }}
                                    name="Best Sell"
                                    style={{ filter: 'drop-shadow(0 0 6px #dc2626)' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        );
    }
}

// ---------------- MARKET CLIENT ----------------
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

    async fetchMarketData() {
        try {
            const res = await fetch('https://api.opsucht.net/market/prices');
            if (!res.ok) throw new Error('Fehler beim Laden der Marktdaten');
            const raw = await res.json();

            const formatted: MarketData = {};
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

    getBestPrice(orders: Order[], side: 'BUY' | 'SELL'): number | null {
        const filtered = orders.filter(o => o.orderSide === side);
        if (!filtered.length) return null;
        return side === 'BUY'
            ? Math.max(...filtered.map(o => o.price))
            : Math.min(...filtered.map(o => o.price));
    }

    scrollToCategory = (cat: string) => {
        const el = document.getElementById(cat);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

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
                <h2 className="market-title">OPSCHUT Market</h2>

                {/* Tabs */}
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

                {/* Kategorien */}
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
                                        <p className="buy-price" style={{ color: '#16a34a' }}>
                                            Best Buy: {formatMoney(bestBuy) ?? '–'}
                                        </p>
                                        <p className="sell-price" style={{ color: '#dc2626' }}>
                                            Best Sell: {formatMoney(bestSell) ?? '–'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* PriceChart Modal Vollbild */}
                {selectedItem && <PriceChart material={selectedItem} onClose={() => this.setState({ selectedItem: null })} />}
            </div>
        );
    }
}

const formatMoney = (money: number) => {
    if (money < 1000) return money.toLocaleString('en-us', {minimumFractionDigits: 2, maximumFractionDigits: 2})
    if (money < 1000000) return (money / 1000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "K"
    if (money < 1000000000) return (money / 1000000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "M"
    if (money < 1000000000000) return (money / 1000000000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "Mrd"
}