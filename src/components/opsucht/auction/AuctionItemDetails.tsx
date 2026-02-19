'use client';

import React from 'react';
import PriceChart from './PriceChart';
import { Page } from '@/app/opsucht/auction/types';
import { formatMoney, getItemIcon } from '@/lib/auction';

interface Props {
    auction: Page;
    names?: Record<string, string>;
}

export default function AuctionItemDetails({ auction, names }: Props) {
    const bidsEntries = Object.entries(auction.bids).sort((a, b) => a[1] - b[1]);

    return (
        <div className="auction-container">

            <div className="info-name">
                <img
                    src={auction.item.icon || getItemIcon(auction.item)}
                    alt={auction.item.displayName ?? auction.item.material}
                    className="item-icon"
                />
                <h2>{auction.item.displayName ?? auction.item.material}</h2>
                <img
                    src={auction.item.icon || getItemIcon(auction.item)}
                    alt={auction.item.displayName ?? auction.item.material}
                    className="item-icon"
                />
            </div>

            <div className="info-bar">
                <span>{bidsEntries.length} Gebote</span>
                <span>Aktuell: {formatMoney(auction.currentBid)}</span>
                <span>Start: {formatMoney(auction.startBid)}</span>

                <div className="live-badge">
                    <span className="live-dot"></span>
                    Live
                </div>
            </div>

            <div className="lower-section">

                <div className="price-card">
                    <PriceChart bids={auction.bids} />
                </div>

                <div className="side-wrapper">
                {(auction.item.lore?.length ||
                        Object.keys(auction.item.enchantments || {}).length) > 0 && (
                        <div className="side-panel">

                            {auction.item.lore?.length > 0 && (
                                <div>
                                    <h3>Lore</h3>
                                    <ul>
                                        {auction.item.lore.map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {auction.item.enchantments &&
                                Object.keys(auction.item.enchantments).length > 0 && (
                                    <div style={{ marginTop: 14 }}>
                                        <h3>Enchantments</h3>
                                        <ul>
                                            {Object.entries(auction.item.enchantments).map(
                                                ([key, level]) => (
                                                    <li key={key}>
                                                        {key
                                                            .replace('minecraft:', '')
                                                            .replace(/_/g, ' ')}{' '}
                                                        {level}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    )}
                </div>

            </div>





        </div>
    );
}
