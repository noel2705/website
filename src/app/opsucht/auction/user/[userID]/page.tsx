import React from 'react';
import {getActiveAuction} from "@/lib/auction";
import {AuctionCard} from "@/components/opsucht/AuctionCard";
import MinecraftNameResolver from "@/lib/minecraftNameResolver";


export default async function UserAuctions({
                                               params,
                                           }: {
    params: Promise<{ userID: string }>;

}) {
    const {userID} = await params;
    const userAuctions = await getActiveAuction(userID)
    const nameResolver = new MinecraftNameResolver()
    const resolvedSellers = await nameResolver.getNames(userAuctions.map(a => a.seller));
    return (<>


        <h1>Auktions Profil: {nameResolver.getName(userID)}</h1>

        {userAuctions.map(a => {
            return <div key={a.uid}>


                <div className={"auction-grid"}>
                    <AuctionCard auction={a} auctionSellerName={resolvedSellers[a.seller]}></AuctionCard>
                </div>

            </div>

        })}


    </>);
}
