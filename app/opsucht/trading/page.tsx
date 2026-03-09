'use client'
import {getSessionUser} from "@/hooks/useUser";
import NoPermission from "@/components/icon/NoPermission";
import {useState} from "react";
import AddProductContainer from "@/components/opsucht/trading/AddProductContainer";

export default function page() {

    const {user, loading} = getSessionUser()
    const [addProduct, setAddProduct] = useState(false);


    if (!user) return <NoPermission/>


    return (<>

            <button onClick={event => {
                event.preventDefault()
                setAddProduct(true)
            }}>Produkt hinzufügen
            </button>

            <AddProductContainer
                addProduct={addProduct}
                setAddProduct={setAddProduct}
            />

            <h1>User Trading</h1>




        </>
    )
}