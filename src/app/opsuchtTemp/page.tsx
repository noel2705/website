'use client'
import React, { useEffect, useState } from 'react'
import AuctionClient from './AutionClientTemp'
import './auction.css'
import { Page } from './types'

const Auction = () => {
    const [auction, setAuction] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAuctions = async () => {
        try {
            const res = await fetch("https://api.opsucht.net/auctions/active")
            const data: Page[] = await res.json()

            const auctions = data.map(a => ({
                ...a,
                endTime: a.endTime
            }))

            setAuction(auctions)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAuctions()

        const interval = setInterval(() => {
            fetchAuctions()
        }, 7000)

        return () => clearInterval(interval)
    }, [])

    if (loading) return <p>Lädt...</p>

    return <AuctionClient auction={auction} />
}

export default Auction
