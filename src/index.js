/* Global Variables */

import { getDataFromServer } from './client/js/getDataFromServer.js'
import { postDataToServer } from './client/js/postDataToServer.js'
import { mySort } from './client/js/mySort.js'
import { createPage } from './client/js/createPage.js'


// Create a new date instance dynamically with JS
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();
let todayDate = new Date(mm + '/' + dd + '/' + yyyy);


// //create POST request to update projectData object endpoint
// const postDataToServer = async (url, data = {}) => {
//     console.log(url, data);
//     const res = await fetch(url, {
//         method: 'POST',
//         credentials: 'same-origin',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         // Body data type must match "Content-Type" header        
//         body: JSON.stringify(data),
//     });
//     console.log(res);
//     try {
//         const newData = await res.json();
//         // console.log(newData);
//         return newData;
//     } catch (error) {
//         console.log("error", error);
//     }
// };



// js for "back to top" button
const topButton = document.getElementById('topButton');
function scrollUp() {
    if (document.documentElement.scrollTop > 0) {
        topButton.style.display = 'block';
    }
    else {
        topButton.style.display = 'none';
    }
};

document.onscroll = function () { scrollUp() };
topButton.addEventListener('click', function () {
    document.documentElement.scrollTop = 0;
});



const geoNamesURL = 'http://api.geonames.org/searchJSON?name=';
const geoNamesKey = '&maxRows=1&username=greggtan';
const weatherBitKey = '&key=dbdc830b94194a76bb97a76204a06dc0';

let tripCount = 0;
let dates = [];
let tripList = [];



//load the existing trips in database
window.addEventListener('load', async () => {
    //get all data from database
    let alldataDB = await getDataFromServer('http://localhost:4321/getData');

    for (let i = 0; i < alldataDB.length; i++) {
        createPage(alldataDB[i]);
    }
})


document.getElementById('generate').addEventListener('click', generateFunction);

async function generateFunction(e) {
    let dbData = {};

    //get city name from user input
    let cityName = document.getElementById('city').value;
    let city = cityName.charAt(0).toUpperCase() + cityName.slice(1);

    //call geonames api to get lat and long
    let myURL = geoNamesURL + cityName + geoNamesKey;
    const geoNamesData = await getDataFromServer(myURL);

    //validate city name and clear search bar if invalid
    if (geoNamesData.totalResultsCount == 0 || cityName == '') {
        alert('You have entered an invalid city name, please try again.')
        document.getElementById('city').value = '';
        document.getElementById('departureDate').value = '';
    }
    //valid city name
    else {


        let country = geoNamesData.geonames[0].countryName;


        let lat = geoNamesData.geonames[0].lat;
        let long = geoNamesData.geonames[0].lng;

        let fullDate = document.getElementById('departureDate').value;
        let startDate = fullDate.substring(0, 10);
        let endDate = fullDate.substring(13, 23);


        let departureDate = new Date(startDate);
        let arrivalDate = new Date(endDate);


        let tripLength = arrivalDate.getTime() - departureDate.getTime();
        let tripLengthDays = (tripLength / (1000 * 3600 * 24)) + 1;

        //calculate difference in departure day and today to see which WeatherBit forecast to use
        let timeDifference = departureDate.getTime() - todayDate.getTime();
        let daysDifference = timeDifference / (1000 * 3600 * 24);

        let flag = false;

        //validate date, dont allow for trips in the past
        if (timeDifference < 0 || fullDate == '') {
            alert('You have entered an invalid date. Please try again.')
            document.getElementById('city').value = '';
            document.getElementById('departureDate').value = '';

        } else {
            //date is not in the past, check if dates already taken by previous trip using database

            let datesData = await getDataFromServer('http://localhost:4321/getDates');
            console.log('dates', datesData);
            if (datesData.length > 0) {
                for (let i = 0; i < datesData.length; i++) {
                    let oldDepartDate = new Date(datesData[i].departDate);
                    let oldArriveDate = new Date(datesData[i].arriveDate);
                    // if depart date in old trip range, or arrival date in old trip range, reject.
                    if ((departureDate.getTime() >= oldDepartDate.getTime() && departureDate.getTime() <= oldArriveDate.getTime()) || (arrivalDate.getTime() >= oldDepartDate.getTime() && arrivalDate.getTime() <= oldArriveDate.getTime())) {
                        flag = true;
                    }
                }
            }

            //push into saved dates when valid
            if (flag == true) {
                alert('You have entered an invalid date, trips cannot overlap. Please try again.')
                document.getElementById('departureDate').value = '';
            } else {
                //store all valid date into object to push to DB later
                dbData.city = city;
                dbData.country = country;
                dbData.departDate = startDate;
                dbData.arriveDate = endDate;
                dbData.tripLengthDays = tripLengthDays;
                dbData.daysDifference = daysDifference;





                let pixaURL = `https://pixabay.com/api/?key=16019640-1f3c1a1b42df8a71e13ea56f1&q=${cityName}&image_type=photo`;
                const pictureData = await getDataFromServer(pixaURL);
                let travelPicURL = '';

                //city exists but obscure location, so pull out country image
                if (pictureData.total == 0) {
                    let newPixaURL = `https://pixabay.com/api/?key=16019640-1f3c1a1b42df8a71e13ea56f1&q=${country}&image_type=photo`;
                    const newPictureData = await getDataFromServer(newPixaURL);
                    travelPicURL = newPictureData.hits[0].largeImageURL;

                } else {
                    travelPicURL = pictureData.hits[0].largeImageURL;
                };

                dbData.travelPicURL = travelPicURL;



                // if within a week from now, give current weather forecast
                if (daysDifference <= 7) {
                    let weatherBitURL = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${long}` + weatherBitKey;
                    const weatherData = await getDataFromServer(weatherBitURL);
                    let temp = weatherData.data[0].temp;



                    //add weather data to DB
                    dbData.weather = `Current temperature: ${temp}°C`;

                    let clouds = weatherData.data[0].clouds;
                    //if clouds>50, mostly cloudy through the day, else mostly clear through the day
                    if (clouds >= 50) {

                        dbData.cloud = 'Mostly cloudy throughout the day';
                    } else {

                        dbData.cloud = 'Mostly clear throughout the day';
                    };



                }   // else if trip is 8 to 16 days away, use predicted forecast
                else if (daysDifference <= 16) {
                    let weatherBitURL = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${long}` + weatherBitKey;
                    const weatherData = await getDataFromServer(weatherBitURL);
                    console.log(weatherData.data[daysDifference - 1]);
                    let highTemp = weatherData.data[daysDifference - 1].high_temp;
                    let lowTemp = weatherData.data[daysDifference - 1].low_temp;


                    dbData.weather = `High: ${highTemp}°C, Low: ${lowTemp}°C`;

                    let clouds = weatherData.data[daysDifference - 1].clouds;
                    //if clouds>50, mostly cloudy through the day, else mostly clear through the day
                    if (clouds >= 50) {

                        dbData.cloud = 'Mostly cloudy throughout the day';
                    } else {

                        dbData.cloud = 'Mostly clear throughout the day';
                    };

                } else {

                    dbData.weather = 'Weather cannot be forecasted for trips more than 16 days later!';
                    dbData.cloud = 'Cloud data cannot be forecasted!';

                }

                //store this trip's data
                console.log('dbData', dbData);
                let dbResponse = await postDataToServer('http://localhost:4321/addToDB', dbData);
                console.log(dbResponse);

                //get all other data (sorted from query)
                let allDB = await getDataFromServer('http://localhost:4321/getData');

                //clear out html and reload
                document.getElementById('trips').innerHTML = '';
                let tripID = 0;

                for (let i = 0; i < allDB.length; i++) {
                    //get id for this newly added trip
                    if (allDB[i].departDate == startDate) {
                        tripID = allDB[i].id;
                    }
                    createPage(allDB[i]);
                }

                if (tripID !== 0) {
                    document.getElementById(`trip${tripID}`).scrollIntoView(true);
                }



            };
        };
    };
};



//import scss files
import './client/styles/style.scss'
import './client/styles/inputBox.scss'

//import js files
import Litepicker from 'litepicker';
let picker = new Litepicker({
    element: document.getElementById('departureDate'),
    singleMode: false,
    mobileFriendly: true,
    format: 'MM/DD/YYYY',
    numberOfMonths: 2,
    numberOfColumns: 2
});

import print from 'print-js';
