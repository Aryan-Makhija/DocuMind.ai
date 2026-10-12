
// const getDocuments = async () => {
//     const response = await fetch("/api/UserStats", {
//         method: "GET",
//         credentials: "same-origin",
//         cache: "no-store",
//     });


"use client"

import { useEffect } from "react";

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(data.error || "Failed to fetch documents");
//     }

// }


export default async function getDocuments() {

    const getDocuments = async () => {


        const response = await fetch("/api/documents", {
            method: "GET",
            headers: {
                "Content-Type":
                    "application/json",
            },
        });

        const data = await response.json();

        console.log(data)

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch documents");
        }

        return data.documents
    }

    useEffect(()=>{
        getDocuments()
    },[])
    return (

        <div>
            <button>Click</button>
        </div>

    )
}

