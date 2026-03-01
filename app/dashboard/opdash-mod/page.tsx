'use client'
import OPDashMod from "@/components/dashboard/opdashmod/opDashMod";
import {getSessionUser} from "@/hooks/useUser";
import NoPermission from "@/components/icon/NoPermission";

export default function opdashPage(){
    const {user, loading} = getSessionUser()

    if(!user?.hasPermission("view.opdash.mod")){
        return <NoPermission message={"Dieses Feature ist noch in Bearbeitung!"}></NoPermission>
    }
    return (
        <>

            <OPDashMod/>

        </>
    )
}