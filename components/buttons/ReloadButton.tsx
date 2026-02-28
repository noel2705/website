'use client'
import React from 'react';



const ReloadButton = () => {
    return (
       <>
           <button onClick={() => window.location.reload()}>Aktualisieren</button>
       </>
    );
}

export default ReloadButton;
