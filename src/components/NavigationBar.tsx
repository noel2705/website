"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./css/NavigationBar.css";

export default function NavigationBar() {
    const pathname = usePathname();

    return (
        <nav className={"navbar"}>
            <ul className={"list"}>
                <li>
                    <Link
                        href="/"
                        className={`${"link"} ${
                            pathname === "/" ? "active" : ""
                        }`}
                    >
                        Home
                    </Link>
                </li>

                <li>
                    <Link
                        href="/users"
                        className={`${"link"} ${
                            pathname === "/users" ? "active" : ""
                        }`}
                    >
                        Users
                    </Link>
                </li>
                <li>
                    <Link
                        href="/opsucht"
                        className={`${"link"} ${
                            pathname === "/opsucht" ? "active" : ""
                        }`}
                    >
                        Auction
                    </Link>
                </li>


            </ul>
        </nav>
    );
}
