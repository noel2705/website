'use client'
import "@/components/css/opdashmod.css"
import Link from "next/link";


export default function OPDashMod() {


    return (
        <>
            <h1>OPDash-Mod</h1>

            <p className={"opdash-info"}>Mit hilfe dieser Mod hast du eine Übersicht über deine Shard-Trades.
                Zudem kannst du jeder Zeit berechnen, was deine Items in Shards Wert sind. Behalte die Übersicht über deine
                Spielzeit, Shard Anzahl und vieles mehr.</p>

            <br/>
            <br/>

            <h1>Shard Handelshistorie:</h1>
            <img src={"/opdash.png"} loading={"lazy"} className={"opdash-img1"} />

            <h2>Die Mod merkt sich alle Trades die du am Shard Händler betätigst, und schreibt sie in eine Datei,
                die du auf dieser Website hochladen kannst.</h2>

            <Link
                className="opdash-link"
                href={"/dashboard/shards"}>Zu den Shard Features</Link>


            <br/>
            <br/>
            <br/>


            <h2>Du hast Interesse die Mod zu Downloaden?</h2>

            <Link
                className="opdash-link"
                href="https://modrinth.com/plugin/case-plugin"
                target="_blank"
            >
                Mod herunterladen
            </Link>
        </>
    )
}
