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
        return { name: "." + data.name, uuid: data.uuid };
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
        this.cache[uuid] =  profile.name;
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(`mcname-${uuid}`, profile.name);
        }
        return  profile.name;
    }

    private async fetchJavaName(uuid: string, retry = 2): Promise<string> {
        const cleanUuid = uuid.replace(/-/g, '');
        await new Promise(r => setTimeout(r, 150));

        try {
            const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${cleanUuid}`);

            if (res.status === 429 && retry > 0) {
                await new Promise(r => setTimeout(r, 800));
                return this.fetchJavaName(uuid, retry - 1);
            }

            if (!res.ok) throw new Error(`Java-API Fehler ${res.status}`);

            const data = await res.json();
            const name = data.username || 'Fehler';

            this.cache[uuid] = name;
            sessionStorage?.setItem(`mcname-${uuid}`, name);

            return name;
        } catch {
            if(isBedrock(uuid)) {
                return this.fetchBedrockName(uuid);
            }
            return "'Fehler beim Laden'";
        }
    }

    public async getName(uuid: string): Promise<string> {
        if (this.cache[uuid]) return this.cache[uuid];

        if (typeof sessionStorage !== 'undefined') {
            const stored = sessionStorage.getItem(`mcname-${uuid}`);
            if (stored) {
                this.cache[uuid] = stored;
                return stored;
            }
        }

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

    public async getUUID(mcName: string): Promise<string | null> {
        try {
            const res = await fetch(
                `https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(mcName)}`
            )

            if (res.ok) {
                const data = await res.json()
                if (data?.uuid) return data.uuid
            }
        } catch (err) {
            console.warn("Ashcon Lookup fehlgeschlagen:", err)
        }

        try {
            const res = await fetch(
                `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(mcName)}`
            )

            if (!res.ok) return null

            const data = await res.json()

            return data?.id
                ? data.id.replace(
                    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
                    "$1-$2-$3-$4-$5"
                )
                : null
        } catch (err) {
            console.error("Mojang Lookup fehlgeschlagen:", err)
            return null
        }
    }
}

