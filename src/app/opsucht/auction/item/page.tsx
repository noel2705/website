'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Page } from '../types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {Item} from "../types";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Minecraft API Resolver mit SessionStorage
class MinecraftNameResolver {
    private cache: Record<string, string> = {};

    async getName(uuid: string): Promise<string> {
        if (this.cache[uuid]) return this.cache[uuid];
        const stored = sessionStorage.getItem(`mcname-${uuid}`);
        if (stored) {
            this.cache[uuid] = stored;
            return stored;
        }

        try {
            const cleanUuid = uuid.replace(/-/g, '');
            const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${cleanUuid}`);
            if (!res.ok) throw new Error('Fetch fehlgeschlagen');
            const data = await res.json();
            const name = data.username || 'Unbekannt';
            this.cache[uuid] = name;
            sessionStorage.setItem(`mcname-${uuid}`, name);
            return name;
        } catch {
            this.cache[uuid] = 'Unbekannt';
            return 'Unbekannt';
        }
    }

    async getNames(uuids: string[]): Promise<Record<string, string>> {
        const result: Record<string, string> = {};
        const toFetch: string[] = [];

        uuids.forEach(uuid => {
            if (this.cache[uuid]) result[uuid] = this.cache[uuid];
            else toFetch.push(uuid);
        });

        await Promise.all(
            toFetch.map(async uuid => {
                result[uuid] = await this.getName(uuid);
            })
        );

        return result;
    }
}

export default function ItemInfo() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState<Page | null>(null);
    const [names, setNames] = useState<Record<string, string>>({});
    const [sellerName, setSellerName] = useState<string>('Lade...');
    const resolver = new MinecraftNameResolver();

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch("https://api.opsucht.net/auctions/active");
            const data2: Page[] = await res.json();

            const newData = data2.find(a => a.uid === data?.uid);

            if (newData) {
                setData(prev => ({ ...prev, ...newData }));
            }

            if (newData?.bids) {
                const uuids = Object.keys(newData.bids);
                resolver.getNames(uuids).then(setNames);
            }

        }, 10000);
        return () => clearInterval(interval);
    });



    useEffect(() => {
        const search = searchParams.get('data');
        if (!search) return;

        const decoded = atob(search);
        const parsed: Page = JSON.parse(decoded);
        setData(parsed);

        const uuids = parsed.bids ? Object.keys(parsed.bids) : [];
        resolver.getNames(uuids).then(setNames);

        resolver.getName(parsed.seller).then(setSellerName);
    }, [searchParams]);

    if (!data) return <p className="p-4 text-gray-500">Lade…</p>;
    const sortedBidsForList = Object.entries(data.bids).sort((a, b) => b[1] - a[1]);

    const sortedBidsForChart = Object.entries(data.bids).sort((a, b) => a[1] - b[1]);

    const chartData = {
        labels: sortedBidsForChart.map(([uuid]) => names[uuid] || '…'),
        datasets: [
            {
                label: 'Gebotsverlauf',
                data: sortedBidsForChart.map(([, amount]) => amount),
                fill: false,
                borderColor: 'rgb(34,197,94)',
                backgroundColor: 'rgb(34,197,94)',
                tension: 0.4,
                pointBackgroundColor: 'rgb(34,197,94)',
                pointHoverRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const name = context.label;
                        const amount = context.parsed.y;
                        return `${name}: ${amount.toLocaleString()} Coins`;
                    },
                },
            },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="rounded-lg overflow-hidden flex flex-col items-center">
                <h1 className="text-5xl font-bold text-white bg-black bg-opacity-50 px-4 py-2 rounded mb-4">
                    {data.item.displayName ?? data.item.material}
                </h1>

                <img
                    src={getItemImage(data)}
                    onError={(e => {
                        e.currentTarget.src =`https://img.mc-api.io/${data.item.material.toLowerCase()}.png`
                    })}
                    alt={data.item.displayName ?? data.item.material}
                    className="w-auto max-h-[600px]"
                />
            </div>


            <div className="flex flex-wrap gap-6 text-gray-100 text-lg">
                <p className="font-semibold">Verkäufer: {sellerName}</p>
                <p className="font-semibold">Start-Preis: {formatMoney(data.startBid)}</p>
                <p className="font-semibold">Aktueller-Preis: {formatMoney(data.currentBid)}</p>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => router.push('/opsucht/auction')}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded"
                >
                    Zurück
                </button>
            </div>

            <div className="bg-gray-900 p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-4 text-white">Alle Bieter</h2>
                <ul className="divide-y divide-gray-700">
                    {sortedBidsForList.map(([uuid, amount]) => (
                        <li
                            key={uuid}
                            className="flex items-center justify-between py-2 px-2 hover:bg-gray-800 rounded"
                        >
                            <span className="font-medium text-white">
                                {names[uuid] || 'Lade...'}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">{amount.toLocaleString()}</span>
                                <img
                                    src="/custom-items/money.svg"
                                    alt="Money Icon"
                                    className="w-5 h-5"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-gray-900 p-4 rounded shadow">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}

const formatMoney = (money: number) => {
    if (money < 1000) return money.toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (money < 1000000) return (money / 1000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "K";
    if (money < 1000000000) return (money / 1000000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "M";
    if (money < 1000000000000) return (money / 1000000000).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "Mrd";
}

const getItemImage = (auction: Page) => {
    return auction.item.icon ?? getItemIcon(auction.item);
}

const getItemIcon = (item: Item) => {
    if (item.icon && item.icon.trim() !== "") return item.icon;
    const normalized = item.displayName?.toLowerCase().
    replace(/[´’']/g, "").
    replace(/\s+/g, "_").
    replace(/[^a-z0-9_]/g, "") || "";
    return `/custom-items/${normalized}.png`;
};
