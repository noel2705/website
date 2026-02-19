'use client';

import React, { useEffect, useState } from 'react';
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
import MinecraftNameResolver from "@/lib/minecraftNameResolver";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const resolver = new MinecraftNameResolver();

interface PriceChartProps {
    bids: Record<string, number>; // { uuid: amount }
}

export default function PriceChart({ bids }: PriceChartProps) {
    const [names, setNames] = useState<Record<string, string>>({});

    useEffect(() => {
        const uuids = Object.keys(bids);
        if (!uuids.length) return;

        resolver.getNames(uuids).then(setNames);
    }, [bids]);

    const sortedBids = Object.entries(bids).sort((a, b) => a[1] - b[1]);

    const labels = sortedBids.map(([uuid]) =>
        names[uuid] ?? uuid.slice(0, 4) + '…'
    );

    const dataValues = sortedBids.map(([, amount]) => amount);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Gebotsverlauf',
                data: dataValues,
                fill: false,
                borderColor: '#3da5f5',
                backgroundColor: '#3da5f5',
                tension: 0.3,
                pointBackgroundColor: '#3da5f5',
                pointHoverBackgroundColor: '#00ffff',
                pointHoverRadius: 6,
                pointRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { left: 20, right: 40, top: 10, bottom: 20 } },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0e1117',
                titleColor: '#3da5f5',
                bodyColor: '#a0e7ff',
                borderColor: '#3da5f5',
                borderWidth: 1,
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
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Preis',
                    color: '#a0e7ff',
                    font: { size: 12 },
                },
                ticks: {
                    color: '#a0e7ff',
                    maxTicksLimit: 5,
                },
                grid: {
                    color: 'rgba(58, 165, 245, 0.2)',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Bieter',
                    color: '#a0e7ff',
                    font: { size: 12 },
                },
                ticks: {
                    color: '#a0e7ff',
                    maxRotation: 45,
                    minRotation: 30,
                    autoSkip: true,
                },
                grid: { color: 'rgba(58, 165, 245, 0.1)' },
            },
        },
    };

    const loading = Object.keys(names).length === 0;

    return (
        <div
            className={loading ? "chart-loading" : ""}
            style={{ width: '100%', height: '250px', paddingRight: '60px' }}
        >
            <Line data={chartData} options={chartOptions as any} />
        </div>
    );
}