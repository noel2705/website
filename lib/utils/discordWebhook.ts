type DiscordField = {
    name: string;
    value: string;
    inline?: boolean;
};

type DiscordWebhookPayload = {
    title: string;
    description?: string;
    color?: number;
    fields?: DiscordField[];
};

const DEFAULT_COLOR = 0x3b82f6;
const MAX_FIELD_VALUE_LENGTH = 1024;

function trimFieldValue(value: string): string {
    if (value.length <= MAX_FIELD_VALUE_LENGTH) return value;
    return `${value.slice(0, MAX_FIELD_VALUE_LENGTH - 3)}...`;
}

export async function sendDiscordWebhook(payload: DiscordWebhookPayload): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
        console.error("Fehler beim Senden des Discord Logs")
        return;
    };

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [
                    {
                        title: payload.title,
                        description: payload.description,
                        color: payload.color ?? DEFAULT_COLOR,
                        timestamp: new Date().toISOString(),
                        fields: (payload.fields ?? []).map((field) => ({
                            ...field,
                            value: trimFieldValue(field.value),
                        })),
                    },
                ],
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error("Discord webhook failed", response.status, body);
        }
    } catch (error) {
        console.error("Discord webhook error", error);
    }
}

