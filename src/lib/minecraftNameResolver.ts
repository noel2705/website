export function isBedrock(uuid: string): boolean {
    // Bedrock-UUIDs starten mit diesem Pattern
    return uuid.startsWith("00000000-0000-0000-0009");
}

export async function getPlayerProfile(uuid: string): Promise<{ name: string; uuid: string }> {
    if (!isBedrock(uuid)) return { name: "Unbekannt", uuid };
    try {
        const res = await fetch(`https://mc-api.io/name/${uuid}`);
        if (!res.ok) throw new Error(`Fehler beim Abrufen von Bedrock-Profil: ${res.status}`);
        const data = await res.json();
        return { name: data.name, uuid: data.uuid };
    } catch (err) {
        console.error("Fehler beim Laden des Bedrock-Profils", err);
        return { name: "Unbekannt", uuid };
    }
}

export default class MinecraftNameResolver {
    private cache: Record<string, string> = {};

    constructor(initialNames?: Record<string, string>) {
        if (initialNames) {
            Object.entries(initialNames).forEach(([uuid, name]) => {
                this.cache[uuid] = name;
            });
        }
    }

    private async fetchBedrockName(uuid: string): Promise<string> {
        const profile = await getPlayerProfile(uuid);
        this.cache[uuid] = profile.name;
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(`mcname-${uuid}`, profile.name);
        }
        return profile.name;
    }

    private async fetchJavaName(uuid: string): Promise<string> {
        const cleanUuid = uuid.replace(/-/g, '');
        try {
            const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${cleanUuid}`);
            if (!res.ok) throw new Error('Java-API Fetch fehlgeschlagen');
            const data = await res.json();
            const name = data.username || 'Unbekannt';
            this.cache[uuid] = name;
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(`mcname-${uuid}`, name);
            }
            return name;
        } catch (err) {
            console.warn(`Java-API fehlgeschlagen für ${uuid}, versuche Bedrock Fallback`);
            return this.fetchBedrockName(uuid);
        }
    }

    public async getName(uuid: string): Promise<string> {
        // 1. Cache prüfen
        if (this.cache[uuid]) return this.cache[uuid];

        // 2. sessionStorage prüfen (nur im Browser verfügbar)
        if (typeof sessionStorage !== 'undefined') {
            const stored = sessionStorage.getItem(`mcname-${uuid}`);
            if (stored) {
                this.cache[uuid] = stored;
                return stored;
            }
        }

        // 3. Fetch, falls unbekannt
        if (isBedrock(uuid)) {
            return this.fetchBedrockName(uuid);
        } else {
            return this.fetchJavaName(uuid);
        }
    }

    public async getNames(uuids: string[]): Promise<Record<string, string>> {
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
