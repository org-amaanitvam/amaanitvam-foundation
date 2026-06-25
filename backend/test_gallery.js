import fetch from "node-fetch";
setTimeout(async () => {
    try {
        const res = await fetch("http://localhost:5000/api/gallery");
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch(err) {
        console.log("Error:", err.message);
    }
}, 2000);
