import { memo } from "react";

interface TimerIconProps {
    size?: number;
    className?: string;
}

const TimerIcon = memo(({ size = 75, className = "" }: TimerIconProps) => (
    <img
        src="/Timer.png"
        alt=""
        width={size}
        height={size}
        className={className}
        loading="lazy"
        decoding="async"
        style={{
            imageRendering: "pixelated",
            width: size,
            height: size,
            aspectRatio: "1 / 1",
            display: "inline-block",
            verticalAlign: "middle",
        }}
    />
));

TimerIcon.displayName = "TimerIcon";

export default TimerIcon;
