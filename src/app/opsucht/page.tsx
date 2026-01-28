import React from 'react'
import AuctionClient from './AutionClient'
import './auction.css'

export interface Page {
    seller: string
    item: Item
    category: string
    currentBid: number
    startBid: number
    bids: Map<string, number>
    endTime: Date
}

export interface Item {
    material: string
    icon: string
    amount: number
    displayName: string
}

const Auction = async () => {
    const res = await fetch("https://api.opsucht.net/auctions/active");
    const auction: Page[] = await res.json();

    return <AuctionClient auction={auction} />
}

export default Auction
