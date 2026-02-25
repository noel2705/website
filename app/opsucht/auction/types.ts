export interface Item {
    material: string
    icon: string
    amount: number
    displayName: string
    lore: string[]
    enchantments: Record<string, number>
}

export interface Page {
    uid: string
    seller: string
    item: Item
    category: string
    startBid: number
    currentBid: number
    highestBidder: string
    bids: Record<string, number>
    startTime: string
    endTime: string
}
