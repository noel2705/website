'use client'
import {useRouter} from "next/navigation";

export default function UserPageButton({name, uuid}: { name: React.ReactNode, uuid: string }) {
const router = useRouter();
    return <button onClick={e => router.push(`/opsucht/auction/user/${uuid}`)} className="name">{name}
    </button>
}