type LoreHighlighterProps = {
    loreLines: string[];
};

export default function ColoredLore({ loreLines }: LoreHighlighterProps) {

    const renderLine = (line: string, index: number) => {
        const parts = line.split(" ");

        return (
            <li key={index}>
                {parts.map((part, i) => {
                    const color = colorMapping.get(part) || "#e8e8e8";
                    return (
                        <span key={i} style={{ color }}>
                            {part}{" "}
                        </span>
                    );
                })}
            </li>
        );
    };

    return (
        <ul>
            {loreLines.map((line, i) => renderLine(line, i))}
        </ul>
    );
}

const colorMapping = new Map<string, string>([
    ["Seltenheit", "#a8a8a8"],
    ["Gewinntyp", "#a8a8a8"],
    ["Item", "#00fcff"],
    ["Mega", "#ff0000"],
    ["Jackpot", "#ff0000"],
    ["Legendär", "#ffac00"],
    ["Episch", "#d900ff"],
    ["✯✯✯", "#ffeb00"],
    ["✯✯✩", "#ffeb00"],
    ["✯✩✩", "#ffeb00"],
    ["Zustand:", "#00ffcd"],
    ["Unbezahlbar", "#00fffd"],
    ["Selten", "#ffac00"],
    ["»", "#d0d0d0"]
]);