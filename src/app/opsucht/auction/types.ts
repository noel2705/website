export interface Item {
    material: string
    icon: string
    amount: number
    displayName: string
}

export interface Page {
    seller: string
    item: Item
    category: string
    currentBid: number
    startBid: number
    bids: Record<string, number>
    endTime: string
    uid: string
}
