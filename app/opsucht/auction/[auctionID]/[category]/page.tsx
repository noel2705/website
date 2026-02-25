import fetch from "node-fetch";
import { Page } from "@/app/opsucht/auction/types";
import BackButton from "@/components/opsucht/auction/BackButton";
import "./auctionItem.css";
import { formatMoney, getItemIcon } from "@/lib/utils/auction";
import EndTimeCard from "@/components/opsucht/auction/EndTimeCard";
import PriceChart from "@/components/opsucht/auction/PriceChart";
import MinecraftNameResolver from "@/lib/utils/minecraftNameResolver";
import ReloadButton from "@/components/opsucht/auction/ReloadButton";
import AuctionExpired from "@/components/opsucht/auction/AuctionExpired";
import UserPageButton from "@/components/opsucht/auction/UserPageButton";
import UserName from "@/components/opsucht/auction/UserName";

export default async function AuctionItemPage({
                                                  params,
                                              }: {
    params: Promise<{ auctionID: string; category: string }>;
}) {
    const { auctionID, category } = await params;
    const data: Page[] = await getAuctionItem(auctionID, category);
    const isExpired = data.length > 0 && new Date(data[0].endTime) < new Date();

    return (
        <>
            {await Promise.all(
                data.map(async (a) => {



                    const bidsSorted = Object.entries(a.bids)
                        .sort((a, b) => b[1] - a[1]);

                    return isExpired ? (
                        <AuctionExpired key={a.uid} />
                    ) : (
                        <div key={a.uid} className="auction-container">

                            <ReloadButton></ReloadButton>

                            <div className="info-name">
                                <img src={getItemIcon(a.item)} alt="" className="item-icon" />
                                <h2>{a.item.displayName ?? a.item.material}</h2>
                                <img src={getItemIcon(a.item)} alt="" className="item-icon" />
                            </div>

                            <div className="info-bar">
                                <BackButton />
                                <span>{bidsSorted.length} Gebote</span>
                                <span>Aktuell: {formatMoney(a.currentBid)}</span>
                                <span>Start: {formatMoney(a.startBid)}</span>
                                <div className="time">
                                    <EndTimeCard endTime={a.endTime} />
                                </div>
                            </div>

                            {/* Chart + Lore */}
                            <div className="lower-section">

                                <div className="price-card">
                                    <PriceChart bids={a.bids} />
                                </div>

                                <div className="side-wrapper">
                                    {(a.item.lore?.length ||
                                        Object.keys(a.item.enchantments || {}).length) > 0 && (
                                        <div className="side-panel">

                                            {a.item.lore?.length > 0 && (
                                                <div>
                                                    <h3>Lore</h3>
                                                    <ul>
                                                        {a.item.lore.map((line, i) => (
                                                            <li key={i}>{line}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {a.item.enchantments &&
                                                Object.keys(a.item.enchantments).length > 0 && (
                                                    <div style={{ marginTop: 14 }}>
                                                        <h3>Enchantments</h3>
                                                        <ul>
                                                            {Object.entries(a.item.enchantments).map(
                                                                ([key, level]) => (
                                                                    <li key={key}>
                                                                        {key.replace("minecraft:", "")
                                                                            .replace(/_/g, " ")}{" "}
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

                            {bidsSorted.length > 0 && (
                                <div className="bids-panel">
                                    <h3>Bieterliste</h3>

                                    <ul className="bids-list">
                                        {bidsSorted.map(([uuid, amount], index) => (
                                            <li key={uuid}>
                                                <span className="rank">#{index + 1}</span>
                                                <UserPageButton name={<UserName uuid={uuid} />} uuid={uuid}></UserPageButton>
                                                <span className="price">
                                                    {formatMoney(amount)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </div>
                    );
                })
            )}
        </>
    );
}

async function getAuctionItem(uid: string, category: string): Promise<Page[]> {
    const url = `https://api.opsucht.net/auctions/active?category=${category}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Auktionen: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("API hat kein Array zurückgegeben");
    }

    return data.filter((item: Page) => item.uid === uid);
}
