'use client';
import {useRouter} from "next/navigation";
import '@/components/css/components.css';
import TimerIcon from "@/components/TimerIcon";
import {Page} from "@/app/opsucht/auction/types";
import {formatEndTime} from "@/lib/auction";

interface EndTimeCardProps {
    endTime: string;
}

export default function EndTimeCard({ endTime }: EndTimeCardProps) {
    return (
        <>
            <h2>{formatEndTime(endTime)}</h2>
            <TimerIcon />
        </>
    );
}