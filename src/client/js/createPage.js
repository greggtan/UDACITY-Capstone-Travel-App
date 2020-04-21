import { postDataToServer } from './postDataToServer.js';
import { getDataFromServer } from './getDataFromServer.js';

function createPage(dbData) {
    let id = dbData.id;
    let city = dbData.city;
    let country = dbData.country;
    let departDate = dbData.departDate;
    let arriveDate = dbData.arriveDate;
    let weather = dbData.weather;
    let cloud = dbData.cloud;
    let travelPicURL = dbData.travelPicURL;
    let tripLengthDays = dbData.tripLengthDays;
    let daysDifference = dbData.daysDifference;

    //now that we have all our data stored in variables, dynamically create travel plan item
    let myTrip = document.createElement('div');
    // tripCount = tripCount + 1
    myTrip.setAttribute('class', 'myTrip');
    myTrip.setAttribute('id', `trip${id}`)

    //create image child and append to myTrip div
    let imgDiv = document.createElement('div');
    imgDiv.setAttribute('class', 'imgDiv');
    let myImage = document.createElement('img');
    myImage.src = travelPicURL;

    imgDiv.appendChild(myImage);
    myTrip.appendChild(imgDiv);

    //create details child and append to myTrip div
    let detailsDiv = document.createElement('div');
    detailsDiv.setAttribute('class', 'detailsDiv');

    let destDetails = document.createElement('h3');
    destDetails.setAttribute('class', 'destinationDetails');
    destDetails.innerText = `My ${tripLengthDays} day trip to: ${city}, ${country}`;
    detailsDiv.appendChild(destDetails);

    let departDetails = document.createElement('h4');
    departDetails.innerText = `Departing: ${departDate}`;
    detailsDiv.appendChild(departDetails);

    let arriveDetails = document.createElement('h4');
    arriveDetails.innerText = `Arriving: ${arriveDate}`;
    detailsDiv.appendChild(arriveDetails);

    let daysAwayDetails = document.createElement('h3');
    daysAwayDetails.setAttribute('class', 'daysAwayDetails');
    if (daysDifference == 1) {
        daysAwayDetails.innerText = `${city}, ${country} is ${daysDifference} day away!`;
    } else {
        daysAwayDetails.innerText = `${city}, ${country} is ${daysDifference} days away!`;
    }
    detailsDiv.appendChild(daysAwayDetails);



    let typicalWeather = document.createElement('h3');
    typicalWeather.innerText = 'Typical Weather:'
    detailsDiv.appendChild(typicalWeather);

    let tempDetails = document.createElement('h4');
    tempDetails.setAttribute('class', 'tempDetails');
    let cloudDetails = document.createElement('h4');
    cloudDetails.setAttribute('class', 'cloudDetails');

    tempDetails.innerText = weather;
    cloudDetails.innerText = cloud;

    detailsDiv.appendChild(tempDetails);
    detailsDiv.appendChild(cloudDetails);
    myTrip.appendChild(detailsDiv);

    let buttonsDiv = document.createElement('div');
    buttonsDiv.setAttribute('class', 'buttonsDiv');

    //add pdf/print button
    let pdfButton = document.createElement('button');
    pdfButton.setAttribute('class', 'pdfButton');
    pdfButton.addEventListener('click', function () {
        printJS({
            printable: myTrip.getAttribute('id'),
            type: 'html',
            css: './main.css'
        })
    });

    let pdfIcon = document.createElement('i');
    pdfIcon.setAttribute('class', 'far fa-file-pdf');

    pdfButton.appendChild(pdfIcon);
    buttonsDiv.appendChild(pdfButton);

    let removeButton = document.createElement('button');
    removeButton.setAttribute('class', 'pdfButton');
    let removeIcon = document.createElement('i');
    removeIcon.setAttribute('class', 'far fa-trash-alt');
    removeButton.appendChild(removeIcon);
    removeButton.addEventListener('click', async function () {
        let removeRecordResponse = await postDataToServer('http://localhost:4321/removeData', dbData);

        //if table empty, manually reset id
        if (document.getElementById('trips').childNodes.length == 1) {
            let resetID = await getDataFromServer('http://localhost:4321/resetID');
        }

        window.location.reload(true);
    });


    buttonsDiv.appendChild(removeButton);
    myTrip.appendChild(buttonsDiv);

    document.getElementById('trips').appendChild(myTrip);

};

export { createPage };