'use client';

import React, { useState, useEffect } from 'react';
import { Page } from '../../../lib/utils/types';
import '../../../components/css/auction/auction.css';
import { getAmountBids } from '@/lib/utils/auction/auction';
import AuctionCard from '@/components/opsucht/auction/AuctionCard';
import MinecraftNameResolver from '@/lib/utils/minecraftNameResolver';

interface Props {
    initialAuction: Page[];
}

type AuctionMode = 'active' | 'expired';
type ExpiredCache = {
    updatedAt: number;
    newestExpiredAt: string | null;
    data: Page[];
};

const EXPIRED_CACHE_PREFIX = 'expired-auctions-cache-v1:';
const EXPIRED_CACHE_TTL_MS = 120000;

const getExpiredCacheKey = (category: string) => `${EXPIRED_CACHE_PREFIX}${category}`;

const readExpiredCache = (category: string): ExpiredCache | null => {
    try {
        const raw = localStorage.getItem(getExpiredCacheKey(category));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ExpiredCache;
        if (!Array.isArray(parsed?.data)) return null;
        return parsed;
    } catch {
        return null;
    }
};

const writeExpiredCache = (category: string, cache: ExpiredCache) => {
    localStorage.setItem(getExpiredCacheKey(category), JSON.stringify(cache));
};

const maxIsoDate = (a: string | null, b: string | null): string | null => {
    if (!a) return b;
    if (!b) return a;
    return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
};

export default function AuctionClient({ initialAuction }: Props) {
    const itemsPerLoad = 18;
    const resolver = new MinecraftNameResolver();

    const [renderCount, setRenderCount] = useState(itemsPerLoad);
    const [auction, setAuction] = useState<Page[]>(initialAuction);
    const [showAuction, setShowAuction] = useState<Page[]>([]);
    const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
    const [category, setCategory] = useState('*');
    const [searchBar, setSearchbar] = useState('');
    const [orderBy, setOrderby] = useState('moneyDesc');
    const [mode, setMode] = useState<AuctionMode>('active');
    const [loadingExpired, setLoadingExpired] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const getSellerName = async (uids: string[]) => {
        return resolver.getNames(uids);
    };

    const hydrateSellerNames = async (data: Page[]) => {
        const rawNames = [...new Set(data.map((e) => e.seller).filter(Boolean))];
        if (rawNames.length === 0) {
            setSellerNames({});
            return;
        }

        const resNames = await getSellerName(rawNames);
        setSellerNames(resNames);
    };

    const fetchActiveAuctions = async (cat: string) => {
        const url = cat === '*'
            ? 'https://api.opsucht.net/auctions/active'
            : `https://api.opsucht.net/auctions/active?category=${cat}`;

        const res = await fetch(url);
        const data: Page[] = await res.json();
        setAuction(data);
        await hydrateSellerNames(data);
    };

    const fetchExpiredAuctions = async (cat: string, forceRefresh = false) => {
        setLoadingExpired(true);

        try {
            const now = Date.now();
            const cache = readExpiredCache(cat);

            if (cache?.data?.length) {
                setAuction(cache.data);
                await hydrateSellerNames(cache.data);
            }

            if (!forceRefresh && cache && now - cache.updatedAt < EXPIRED_CACHE_TTL_MS) {
                return;
            }

            const query = new URLSearchParams();
            if (cat !== '*') query.set('category', cat);
            query.set('limit', '300');
            if (cache?.newestExpiredAt) query.set('sinceExpiredAt', cache.newestExpiredAt);

            const res = await fetch(`/api/expired-auctions?${query.toString()}`, {
                cache: 'no-store',
            });

            if (!res.ok) throw new Error('Fehler beim Laden abgelaufener Auktionen');

            const json = await res.json();
            const responseItems: Page[] = Array.isArray(json)
                ? json
                : Array.isArray(json?.items)
                    ? json.items
                    : [];
            const responseNewestExpiredAt: string | null =
                typeof json?.newestExpiredAt === 'string' ? json.newestExpiredAt : null;

            const expiredOnly = Array.isArray(responseItems)
                ? responseItems.filter(a => new Date(a.endTime).getTime() <= Date.now())
                : [];

            const mergedMap = new Map<string, Page>();

            if (cache?.data?.length) {
                for (const item of cache.data) {
                    if (item?.uid) mergedMap.set(item.uid, item);
                }
            }

            for (const item of expiredOnly) {
                if (item?.uid) mergedMap.set(item.uid, item);
            }

            const merged = [...mergedMap.values()].sort(
                (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
            );
            const capped = merged.slice(0, 500);
            const newestExpiredAt = maxIsoDate(cache?.newestExpiredAt ?? null, responseNewestExpiredAt);

            writeExpiredCache(cat, {
                updatedAt: Date.now(),
                newestExpiredAt,
                data: capped,
            });

            setAuction(capped);
            await hydrateSellerNames(capped);
        } catch (err) {
            console.error('Fehler beim Laden abgelaufener Auktionen:', err);
        } finally {
            setLoadingExpired(false);
        }
    };

    const sortAuctions = (auctionData: Page[]) => {
        let filtered: Page[] = Array.isArray(auctionData) ? auctionData : [];

        if (searchBar.trim() !== '') {
            filtered = filtered.filter((a) =>
                (a.item.displayName ?? a.item.material)
                    .toLowerCase()
                    .includes(searchBar.toLowerCase())
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            switch (orderBy) {
                case 'timeDesc':
                    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
                case 'timeAsc':
                    return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
                case 'moneyAsc':
                    return a.currentBid - b.currentBid;
                case 'moneyDesc':
                    return b.currentBid - a.currentBid;
                case 'bitAmountDesc':
                    return getAmountBids(b.bids) - getAmountBids(a.bids);
                case 'bitAmountAsc':
                    return getAmountBids(a.bids) - getAmountBids(b.bids);
                default:
                    return 0;
            }
        });

        setShowAuction(sorted);
    };

    useEffect(() => {
        const storedCategory = sessionStorage.getItem('category') || '*';
        const storedSearchBar = sessionStorage.getItem('searchBar') || '';
        const storedOrderBy = sessionStorage.getItem('orderBy') || 'moneyDesc';
        const storedMode = (sessionStorage.getItem('auctionMode') as AuctionMode) || 'active';

        if (storedCategory !== category) setCategory(storedCategory);
        if (storedSearchBar !== searchBar) setSearchbar(storedSearchBar);
        if (storedOrderBy !== orderBy) setOrderby(storedOrderBy);
        if (storedMode !== mode) setMode(storedMode);
        setInitialized(true);
    }, []);

    useEffect(() => {
        sessionStorage.setItem('category', category);
    }, [category]);

    useEffect(() => {
        sessionStorage.setItem('orderBy', orderBy);
        sortAuctions(auction);
    }, [orderBy]);

    useEffect(() => {
        sessionStorage.setItem('searchBar', searchBar);
        sortAuctions(auction);
    }, [searchBar]);

    useEffect(() => {
        if (!initialized) return;
        sessionStorage.setItem('auctionMode', mode);

        if (mode === 'active') {
            void fetchActiveAuctions(category);
            return;
        }

        void fetchExpiredAuctions(category);
    }, [mode, category, initialized]);

    useEffect(() => {
        sortAuctions(auction);
    }, [auction, orderBy, searchBar]);

    useEffect(() => {
        setRenderCount(itemsPerLoad);
    }, [showAuction?.length]);

    useEffect(() => {
        if (!initialized) return;

        const interval = setInterval(() => {
            if (mode === 'active') {
                void fetchActiveAuctions(category);
                return;
            }

            void fetchExpiredAuctions(category, true);
        }, 10000);

        return () => clearInterval(interval);
    }, [category, mode, initialized]);

    useEffect(() => {
        const sentinel = document.getElementById('scroll-sentinel');
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setRenderCount((prev) => Math.min(prev + itemsPerLoad, showAuction?.length ?? 0));
                }
            },
            {
                root: null,
                rootMargin: '300px',
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [showAuction]);

    return (
        <>
            <div className="search-row">
                <input
                    type="text"
                    placeholder="Item suchen (z.B. Netherite, Schwert, Beacon ...)"
                    value={searchBar}
                    onChange={(e) => setSearchbar(e.target.value)}
                />
            </div>

            <div className="auction-toolbar">
                <div className="categorySwitcher">
                    <button
                        onClick={() => setMode('active')}
                        className={mode === 'active' ? 'active' : ''}
                    >
                        Aktiv
                    </button>
                    <button
                        onClick={() => setMode('expired')}
                        className={mode === 'expired' ? 'active' : ''}
                    >
                        Abgelaufen
                    </button>
                </div>

                <div className="categorySwitcher">
                    <button
                        onClick={() => setCategory('*')}
                        className={category === '*' ? 'active' : ''}
                    >
                        <img src="https://img.mc-api.io/nether_star.png" />
                        Alles
                    </button>

                    <button
                        onClick={() => setCategory('custom_items')}
                        className={category === 'custom_items' ? 'active' : ''}
                    >
                        <img src="https://img.mc-api.io/netherite_ingot.png" />
                        Custom Items
                    </button>

                    <button
                        onClick={() => setCategory('tools_armor')}
                        className={category === 'tools_armor' ? 'active' : ''}
                    >
                        <img src="https://img.mc-api.io/iron_sword.png" />
                        Werkzeuge & Ruestung
                    </button>

                    <button
                        onClick={() => setCategory('op_items')}
                        className={category === 'op_items' ? 'active' : ''}
                    >
                        <img src="https://img.mc-api.io/beacon.png" />
                        OP Items
                    </button>

                    <button
                        onClick={() => setCategory('spawn_eggs')}
                        className={category === 'spawn_eggs' ? 'active' : ''}
                    >
                        <img src="https://img.mc-api.io/blaze_spawn_egg.png" />
                        Spawn Eggs
                    </button>

                    <button
                        onClick={() => setCategory('other')}
                        className={category === 'other' ? 'active' : ''}
                    >
                        <img src="https://img.mc-api.io/ender_chest.png" />
                        Sonstiges
                    </button>
                </div>

                <div className="auction-toolbar-rarity">
                    <div className="categorySwitcher">
                        <div className="sort">
                            <select value={orderBy} onChange={(e) => setOrderby(e.target.value)}>
                                <option value="moneyDesc">Preis: Groß -{">"} Klein</option>
                                <option value="moneyAsc">Preis: Klein -{">"} Gross</option>
                                <option value="timeDesc">Endet bald</option>
                                <option value="timeAsc">Neuste</option>
                                <option value="bitAmountDesc">Meiste Gebote</option>
                                <option value="bitAmountAsc">Wenigste Gebote</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loadingExpired && mode === 'expired' && <p>Lade abgelaufene Auktionen...</p>}

            <div className="auction-grid">
                {showAuction?.slice(0, renderCount).map((a) => (
                    <AuctionCard key={a.uid} auction={a} auctionSellerName={sellerNames[a.seller]} />
                ))}
            </div>

            <div id="scroll-sentinel" style={{ height: 1 }} />
        </>
    );
}
