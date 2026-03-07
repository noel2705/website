'use client'
import {getSessionUser} from "@/hooks/useUser";
import NoPermission from "@/components/icon/NoPermission";

export default function page(){


    const {user, loading} = getSessionUser()

    if(!user) return <NoPermission/>


    return ( <>



            <h1>User Trading</h1>






        </>
    )
}