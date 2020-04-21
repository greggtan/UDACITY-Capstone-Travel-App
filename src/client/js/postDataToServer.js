//create POST request to update projectData object endpoint
const postDataToServer = async (url, data = {}) => {
    console.log(url, data);
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        // Body data type must match "Content-Type" header        
        body: JSON.stringify(data),
    });
    console.log(res);
    try {
        const newData = await res.json();
        // console.log(newData);
        return newData;
    } catch (error) {
        console.log("error", error);
    }
};

export {postDataToServer};