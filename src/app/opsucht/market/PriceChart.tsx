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

type DailyPricePoint = { timestamp: string; bestBuy: number; bestSell: number; };

interface PriceChartProps { material: string; onClose: () => void; }
interface PriceChartState { data: DailyPricePoint[] | null; loading: boolean; error: string | null; }

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
                bestBuy: Number(day.avgPrice),    // GRÜN
                bestSell: Number(day.maxPrice),   // ROT
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



                                <defs>
                                    <linearGradient id="gradBuy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.4} /> {/* GRÜN */}
                                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="gradSell" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.4} /> {/* ROT */}
                                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>


                                {/* Hintergrundbereiche */}
                                <Area type="monotone" dataKey="bestBuy" stroke="none" fill="url(#gradBuy)" />
                                <Area type="monotone" dataKey="bestSell" stroke="none" fill="url(#gradSell)" />

                                {/* Linien */}
                                <Line
                                    type="monotone"
                                    dataKey="bestBuy"
                                    stroke="#dc2626" // GRÜN für Kauf
                                    strokeWidth={3}
                                    dot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
                                    activeDot={{ r: 10 }}
                                    name="Best Buy"
                                    style={{ filter: 'drop-shadow(0 0 6px #16a34a)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="bestSell"
                                    stroke="#16a34a" // ROT für Verkauf
                                    strokeWidth={3}
                                    dot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
                                    activeDot={{ r: 10 }}
                                    name="Best Sell"
                                    style={{ filter: 'drop-shadow(0 0 6px #dc2626)' }}
                                />

                            </LineChart>
                        </ResponsiveContainer>
                    )}

                    {!loading && (!data || data.length === 0) && <p style={{ color: '#fff', textAlign: 'center' }}>Keine Daten verfügbar</p>}
                </div>
            </div>
        );
    }
}
