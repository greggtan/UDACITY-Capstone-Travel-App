async function getDataFromServer(url){
    console.log(url);
    const res = await fetch(url)
    try {
        const data = await res.json();
        console.log(data)
        return data;
    } catch (error) {
        console.log("error", error);
        // appropriately handle the error
    }
};



export {getDataFromServer};