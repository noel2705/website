'use client'
export default function UserPageButton({ name, uuid }: { name: React.ReactNode, uuid: string }) {
    return (
        <button
            onClick={() => {
                if (typeof window === "undefined") return;
                const hash = `user=${encodeURIComponent(uuid)}`;
                const target = `/opsucht/auction#${hash}`;
                if (window.location.pathname === "/opsucht/auction") {
                    window.location.hash = hash;
                } else {
                    window.location.href = target;
                }
            }}
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
