import React from "react";
import Link from "next/link";
import "./css/auctionExpired.css"; // optional, für Styling

const AuctionExpired = () => {
    return (
        <div className="auction-expired-container">
            <h2>Auktion beendet</h2>
            <p>Diese Auktion ist leider vorbei. Schau dir andere spannende Auktionen an!</p>
            <Link href="/opsucht/auction">
                <button className="auction-expired-button">Weitere Auktionen</button>
            </Link>
        </div>
    );
};

export default AuctionExpired;
