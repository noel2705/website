export default async function AuctionItemPage({
                                                  params,
                                              }: {
    params: Promise<{ auctionID: string }>;
}) {
    const { auctionID } = await params;


    return (
        <>

        </>
    );
}
