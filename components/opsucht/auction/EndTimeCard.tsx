'use client';
import { useEffect, useMemo, useState } from "react";
import TimerIcon from "@/components/icon/TimerIcon";
import { formatEndTime } from "@/lib/utils/auction/auction";

interface EndTimeCardProps {
    endTime: string;
    showEndDate: boolean;
}

export default function EndTimeCard({ endTime, showEndDate }: EndTimeCardProps) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const endText = useMemo(() => {
        return formatEndTime(endTime);
    }, [endTime, now]);

    const isEnded = endText === "Beendet";

    const formattedEndedAt = new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(Date.parse(endTime));

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {!showEndDate ? (
                <h2 style={{ margin: 0, color: isEnded ? "#ef4444" : undefined }}>
                    {endText}
                </h2>
            ) : (
                <span>Endet am {formattedEndedAt}</span>
            )}
            <TimerIcon />
        </div>
    );
}