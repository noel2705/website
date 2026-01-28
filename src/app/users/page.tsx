import React from 'react'

interface User {
    id: number;
    name: string
}

const UserPage = async () => {

    const res = await fetch("https://jsonplaceholder.typicode.com/users",
        {next: {revalidate: 10}});
    const users: User[] = await res.json();


    return (
        <>

            <h1>Benutzer:</h1>

            <ul>
                {users.map(user => <li key={user.id}>{user.name}</li>)}
            </ul>

        </>
    )
}

export default UserPage