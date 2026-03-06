'use client';
import { useEffect, useState } from "react";
import TimerIcon from "@/components/icon/TimerIcon";
import { formatEndTime } from "@/lib/utils/auction/auction";

interface EndTimeCardProps {
    endTime: string;
}

export default function EndTimeCard({ endTime }: EndTimeCardProps) {
    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="end-time-card" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h2 style={{ margin: 0 }}>{formatEndTime(endTime)}</h2>
            <TimerIcon />
        </div>
    );
}
