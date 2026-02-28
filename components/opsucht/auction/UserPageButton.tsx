'use client'
import { useRouter } from "next/navigation";

export default function UserPageButton({ name, uuid }: { name: React.ReactNode, uuid: string }) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push(`/opsucht/auction/user/${uuid}`)}
            style={{
                backgroundColor: '#181818',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#555')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#181818')}
        >
            {name}
        </button>
    );
}