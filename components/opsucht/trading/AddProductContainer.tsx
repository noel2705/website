'use client'
import "../../css/trading/trading.css"
import { useState } from "react";

export default function AddProductContainer({
    addProduct,
    setAddProduct
}: {
    addProduct?: boolean;
    setAddProduct: (value: boolean) => void;
}) {
    if (!addProduct) return null;

    const [itemName, setItemName] = useState("");
    const [itemPrice, setItemPrice] = useState(0);

    return (
        <div className="add-container-overlay">
            <div className="add-container">
                <h3 className="add-container-title">Produkt hinzufügen</h3>

                <div className="input-group">
                    <label className="input-label" htmlFor="item-name">Name</label>
                    <input
                        id="item-name"
                        type="text"
                        className="item-name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="item-price">Preis</label>
                    <input
                        id="item-price"
                        type="number"
                        className="item-price"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(Number(e.target.value))}
                    />
                </div>

                <div className="button-row">
                    <button className="primary-button" onClick={() => setAddProduct(false)}>
                        Produkt hinzufuegen
                    </button>
                    <button className="secondary-button" onClick={() => setAddProduct(false)}>
                        Schliessen
                    </button>
                </div>
            </div>
        </div>
    );
}
