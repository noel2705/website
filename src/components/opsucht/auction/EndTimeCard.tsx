'use client';
import { useEffect, useState } from "react";
import TimerIcon from "@/components/icon/TimerIcon";
import { formatEndTime } from "@/lib/auction";

interface EndTimeCardProps {
    endTime: string;
}

export default function EndTimeCard({ endTime }: EndTimeCardProps) {
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="end-time-card" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h2 style={{ margin: 0 }}>{formatEndTime(endTime, currentTime)}</h2>
            <TimerIcon />
        </div>
    );
}
