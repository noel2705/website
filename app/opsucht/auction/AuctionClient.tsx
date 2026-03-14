'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Page} from '../../../lib/utils/types';
import '../../../components/css/auction/auction.css';
import {getAmountBids} from '@/lib/utils/auction/auction';
import AuctionCard from '@/components/opsucht/auction/AuctionCard';
import MinecraftNameResolver, {NameStorage} from '@/lib/utils/minecraftNameResolver';
import {AuctionCategory, normalizeAuctions, normalizeCategoryDefinitions} from '@/lib/utils/auction/normalize';
import { useSessionUser } from '@/hooks/useUser';

interface Props {
    initialAuction: Page[];
}

type AuctionMode = 'active' | 'expired';
const ACTIVE_REFRESH_INTERVAL_MS = 10000;
const EXPIRED_REFRESH_INTERVAL_MS = 120000;
const EXPIRED_LIMIT_OPTIONS = [10, 50, 100, 250, 500, 'all'] as const;
type ExpiredLimitOption = (typeof EXPIRED_LIMIT_OPTIONS)[number];
const DEFAULT_EXPIRED_LIMIT = 100;
const EXPIRED_AUCTIONS_API_BASE = process.env.NEXT_PUBLIC_AUCTION_BACKEND_URL?.replace(/\/$/, '') ?? '';

const maxIsoDate = (a: string | null, b: string | null): string | null => {
    if (!a) return b;
    if (!b) return a;
    return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
};

const isParent = (name: string) => name.startsWith('parent_');
const toApiCategory = (category: string) => (category === '*' || isParent(category) ? '*' : category);

export default function AuctionClient({initialAuction}: Props) {
    const itemsPerLoad = 25;
    const resolver = useMemo(
        () =>
            new MinecraftNameResolver({
                storageProvider: typeof window !== 'undefined' ? localStorage : undefined,
            }),
        []
    );
    const { user } = useSessionUser();

    const [renderCount, setRenderCount] = useState(itemsPerLoad);
    const [auction, setAuction] = useState<Page[]>(normalizeAuctions(initialAuction));
    const [showAuction, setShowAuction] = useState<Page[]>([]);
    const [expiredLimit, setExpiredLimit] = useState<ExpiredLimitOption>(DEFAULT_EXPIRED_LIMIT);
    const [expiredTotalCount, setExpiredTotalCount] = useState<number | null>(null);
    const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
    const [category, setCategory] = useState('*');
    const [searchBar, setSearchbar] = useState('');
    const [orderBy, setOrderby] = useState('moneyDesc');
    const [viewMode, setViewMode] = useState('*');
    const [mode, setMode] = useState<AuctionMode>('active');
    const [loadingExpired, setLoadingExpired] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [debouncedSearchBar, setDebouncedSearchBar] = useState('');
    const [categories, setCategories] = useState<AuctionCategory[]>([]);
    const [expandedParent, setExpandedParent] = useState<string | null>(null);

    const prevExpiredLimitRef = useRef(expiredLimit);
    const prevExpiredSearchRef = useRef('');

    const parentCategories = useMemo(
        () => categories.filter((entry) => !entry.parentCategory),
        [categories]
    );

    const childrenByParent = useMemo(() => {
        const map = new Map<string, AuctionCategory[]>();
        for (const entry of categories) {
            if (!entry.parentCategory) continue;
            if (!map.has(entry.parentCategory)) {
                map.set(entry.parentCategory, []);
            }
            map.get(entry.parentCategory)?.push(entry);
        }
        return map;
    }, [categories]);

    const activeCategorySet = useMemo(() => {
        if (category === '*') return null;
        if (isParent(category)) {
            const children = childrenByParent.get(category) ?? [];
            return new Set<string>([category, ...children.map((child) => child.name)]);
        }
        return new Set<string>([category]);
    }, [category, childrenByParent]);

    const canSelectExpiredAll = user?.hasPermission('auctions.expired.limit.all') ?? false;
    const getSellerName = async (uids: string[]) => resolver.getNames(uids);

    const hydrateSellerNames = async (data: Page[]) => {
        const rawNames = [...new Set(data.map((e) => e.seller).filter(Boolean))];
        if (rawNames.length === 0) {
            setSellerNames({});
            return;
        }

        const resNames = await getSellerName(rawNames);
        setSellerNames(resNames);
    };

    const fetchCategoryDefs = async () => {
        const response = await fetch('https://api.opsucht.net/auctions/categories', {cache: 'no-store'});
        if (!response.ok) throw new Error('Kategorien konnten nicht geladen werden');
        const parsed = normalizeCategoryDefinitions(await response.json());
        setCategories(parsed);
    };

    const fetchActiveAuctions = async (selectedCategory: string) => {
        const apiCategory = toApiCategory(selectedCategory);
        const url = apiCategory === '*'
            ? 'https://api.opsucht.net/auctions/active'
            : `https://api.opsucht.net/auctions/active?category=${apiCategory}`;

        const res = await fetch(url, {cache: 'no-store'});
        const data = normalizeAuctions(await res.json());
        setAuction(data);
        setExpiredTotalCount(null);
        await hydrateSellerNames(data);
    };

    const fetchExpiredAuctions = async (
        selectedCategory: string,
        forceRefresh = false,
        queryValue = ''
    ) => {
        setLoadingExpired(true);

        try {
            const query = new URLSearchParams();
            const apiCategory = toApiCategory(selectedCategory);
            if (apiCategory !== '*') query.set('category', apiCategory);
            query.set('limit', expiredLimit === 'all' ? 'all' : String(expiredLimit));
            const trimmedQuery = queryValue.trim();
            if (trimmedQuery.length > 0) {
                query.set('q', trimmedQuery);
            }

            const endpoint = EXPIRED_AUCTIONS_API_BASE
                ? `${EXPIRED_AUCTIONS_API_BASE}/api/expired-auctions?${query.toString()}`
                : `/api/expired-auctions?${query.toString()}`;

            const res = await fetch(endpoint, {
                cache: 'no-store',
            });

            if (!res.ok) throw new Error('Fehler beim Laden abgelaufener Auktionen');

            const json = await res.json();
            const responseItems = normalizeAuctions(Array.isArray(json) ? json : json?.items);
            const responseTotalCount: number | null =
                typeof json?.totalCount === 'number' ? json.totalCount : null;

            setAuction(responseItems);
            setExpiredTotalCount(responseTotalCount);
            await hydrateSellerNames(responseItems);
        } catch (err) {
            console.error('Fehler beim Laden abgelaufener Auktionen:', err);
        } finally {
            setLoadingExpired(false);
        }
    };

    const sortAuctions = (auctionData: Page[]) => {
        let filtered: Page[] = Array.isArray(auctionData) ? auctionData : [];

        if (activeCategorySet) {
            filtered = filtered.filter((entry) => activeCategorySet.has(entry.category));
        }

        if (mode === 'active' && searchBar.trim() !== '') {
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

    const onParentClick = (parentName: string) => {
        setCategory(parentName);
        const hasChildren = (childrenByParent.get(parentName) ?? []).length > 0;
        if (!hasChildren) return;

        setExpandedParent((prev) => (prev === parentName && category === parentName ? null : parentName));
    };

    const onChildClick = (parentName: string, childName: string) => {
        setExpandedParent(parentName);
        setCategory(childName);
    };

    useEffect(() => {
        void fetchCategoryDefs();
    }, []);

    useEffect(() => {
        const storedCategory = sessionStorage.getItem('category') || '*';
        const storedSearchBar = sessionStorage.getItem('searchBar') || '';
        const storedOrderBy = sessionStorage.getItem('orderBy') || 'moneyDesc';
        const storedMode = (sessionStorage.getItem('auctionMode') as AuctionMode) || 'active';
        const storedExpiredLimitRaw = sessionStorage.getItem('expiredLimit');
        const storedExpiredLimit =
            storedExpiredLimitRaw === 'all'
                ? 'all'
                : Number(storedExpiredLimitRaw || DEFAULT_EXPIRED_LIMIT);
        const normalizedExpiredLimit = EXPIRED_LIMIT_OPTIONS.includes(storedExpiredLimit as ExpiredLimitOption)
            ? (storedExpiredLimit as ExpiredLimitOption)
            : DEFAULT_EXPIRED_LIMIT;

        if (storedCategory !== category) setCategory(storedCategory);
        if (storedSearchBar !== searchBar) setSearchbar(storedSearchBar);
        setDebouncedSearchBar(storedSearchBar);
        prevExpiredSearchRef.current = storedSearchBar.trim().toLowerCase();
        if (storedOrderBy !== orderBy) setOrderby(storedOrderBy);
        if (storedMode !== mode) setMode(storedMode);
        if (normalizedExpiredLimit !== expiredLimit) setExpiredLimit(normalizedExpiredLimit);
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!category.startsWith('sub_')) return;
        const found = categories.find((entry) => entry.name === category);
        if (!found?.parentCategory) return;

        setExpandedParent(found.parentCategory as string);
    }, [category, categories]);

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
    }, [searchBar, mode]);

    useEffect(() => {
        if (mode !== 'expired') return;
        const timeout = setTimeout(() => {
            setDebouncedSearchBar(searchBar);
        }, 250);

        return () => clearTimeout(timeout);
    }, [searchBar, mode]);

    useEffect(() => {
        sessionStorage.setItem('expiredLimit', String(expiredLimit));
    }, [expiredLimit]);

    useEffect(() => {
        if (!initialized) return;
        sessionStorage.setItem('auctionMode', mode);

        if (mode === 'active') {
            void fetchActiveAuctions(category);
            return;
        }

        void fetchExpiredAuctions(category, false, searchBar);
    }, [mode, category, initialized]);

    useEffect(() => {
        if (!initialized || mode !== 'expired') return;
        if (prevExpiredLimitRef.current === expiredLimit) return;
        prevExpiredLimitRef.current = expiredLimit;
        void fetchExpiredAuctions(category, true, debouncedSearchBar);
    }, [expiredLimit, initialized, mode, category]);

    useEffect(() => {
        if (!initialized || mode !== 'expired') return;
        const normalized = debouncedSearchBar.trim().toLowerCase();
        if (prevExpiredSearchRef.current === normalized) return;
        prevExpiredSearchRef.current = normalized;
        void fetchExpiredAuctions(category, true, debouncedSearchBar);
    }, [debouncedSearchBar, initialized, mode, category]);

    useEffect(() => {
        if (canSelectExpiredAll) return;
        if (expiredLimit !== 'all') return;
        setExpiredLimit(DEFAULT_EXPIRED_LIMIT);
    }, [canSelectExpiredAll, expiredLimit]);

    useEffect(() => {
        sortAuctions(auction);
    }, [auction, orderBy, searchBar, mode, activeCategorySet]);

    useEffect(() => {
        setRenderCount(itemsPerLoad);
    }, [showAuction?.length]);

    useEffect(() => {
        if (!initialized) return;

        const refreshIntervalMs =
            mode === 'expired' ? EXPIRED_REFRESH_INTERVAL_MS : ACTIVE_REFRESH_INTERVAL_MS;

        const interval = setInterval(() => {
            if (mode === 'active') {
                void fetchActiveAuctions(category);
                return;
            }

            void fetchExpiredAuctions(category, true, debouncedSearchBar);
        }, refreshIntervalMs);

        return () => clearInterval(interval);
    }, [category, mode, initialized, expiredLimit, debouncedSearchBar]);

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

    const filteredAuctions = showAuction?.filter((a) => {
        if (viewMode === "bids") {
            return Object.keys(a.bids).length > 0
        }
        return true
    }) ?? []

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

                <div className="category-tree">
                    <button
                        onClick={() => {
                            setExpandedParent(null);
                            setCategory('*');
                        }}
                        className={`category-root-btn ${category === '*' ? 'active' : ''}`}
                    >
                        <img src="https://img.mc-api.io/nether_star.png" alt="Alles"/>
                        Alles
                    </button>

                    {parentCategories.map((parent) => {
                        const children = childrenByParent.get(parent.name) ?? [];
                        const expanded = expandedParent === parent.name;
                        return (
                            <div key={parent.name} className="category-group">
                                <button
                                    onClick={() => onParentClick(parent.name)}
                                    className={`category-parent-btn ${category === parent.name ? 'active' : ''}`}
                                >
                                    <img src={parent.icon} alt={parent.displayName}/>
                                    <span>{parent.displayName}</span>
                                    {children.length > 0 && (
                                        <span className={`category-chevron ${expanded ? 'open' : ''}`}>v</span>
                                    )}
                                </button>

                                {children.length > 0 && expanded && (
                                    <div className="category-children">
                                        {children.map((child) => (
                                            <button
                                                key={child.name}
                                                onClick={() => onChildClick(parent.name, child.name)}
                                                className={`category-child-btn ${category === child.name ? 'active' : ''}`}
                                            >
                                                <img src={child.icon} alt={child.displayName}/>
                                                <span>{child.displayName}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="auction-toolbar-rarity">
                    <div className="categorySwitcher">
                        <div className="sort">
                            <select value={orderBy} onChange={(e) => setOrderby(e.target.value)}>
                                <option value="moneyDesc">Preis: Groß -&gt; Klein</option>
                                <option value="moneyAsc">Preis: Klein -&gt; Groß</option>
                                <option value="timeDesc">{mode === 'active' ? 'Endet bald' : 'Älteste'}</option>
                                <option value="timeAsc">Neueste</option>
                                <option value="bitAmountDesc">Meiste Gebote</option>
                                <option value="bitAmountAsc">Wenigste Gebote</option>
                            </select>
                        </div>
                        {mode === 'expired' && (
                            <div className="sort">
                                <select
                                    value={expiredLimit}
                                    onChange={(e) => {
                                        const selected = e.target.value as ExpiredLimitOption;
                                        if (selected === 'all' && !canSelectExpiredAll) {
                                            setExpiredLimit(DEFAULT_EXPIRED_LIMIT);
                                            return;
                                        }
                                        setExpiredLimit(selected);
                                    }}
                                    aria-label="Anzahl abgelaufener Auktionen insgesamt"
                                    title="Wie viele abgelaufene Auktionen insgesamt angezeigt und geladen werden"
                                >
                                    {EXPIRED_LIMIT_OPTIONS.map((limit) => (
                                        <option
                                            key={limit}
                                            value={limit}
                                            disabled={limit === 'all' && !canSelectExpiredAll}
                                        >
                                            Insgesamt anzeigen: {limit === 'all'
                                            ? (canSelectExpiredAll ? 'Alle' : 'Alle (Nicht freigeschaltet)')
                                            : limit}
                                        </option>
                                    ))}
                            </select>
                            </div>
                            )}

                        <div className="sort">
                            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                                <option value="*">Alle Auktionen</option>
                                <option value="bids">Auktionen mit Geboten</option>
                            </select>
                        </div>

                    </div>
                </div>
            </div>

            {mode === 'expired' && (
                <div className="expired-info">
                    <span>Geladen: {filteredAuctions.length}</span>
                    <span>
            Insgesamt gefunden: {expiredTotalCount === null ? 'unbekannt' : expiredTotalCount}
        </span>
                </div>
            )}

            {loadingExpired && mode === 'expired' && <p>Lade abgelaufene Auktionen...</p>}

            <div className="auction-grid">
                {filteredAuctions
                    .slice(0, renderCount)
                    .map((a) => (
                        <AuctionCard
                            key={a.uid}
                            auction={a}
                            auctionSellerName={sellerNames[a.seller] ?? 'Wird geladen...'}
                            mode={mode}
                        />
                    ))}
            </div>
            <div id="scroll-sentinel" style={{height: 1}}/>
        </>
    );
}
