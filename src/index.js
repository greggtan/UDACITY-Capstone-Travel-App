/* Global Variables */

import { getDataFromServer } from './client/js/getDataFromServer.js'
import {mySort} from './client/js/mySort.js'


// Create a new date instance dynamically with JS
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();
let todayDate = new Date(mm + '/' + dd + '/' + yyyy);



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


document.getElementById('generate').addEventListener('click', generateFunction);

async function generateFunction(e) {

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
        console.log(country, lat, long);

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
            //date is not in the past, check if dates already taken by previous trip
            if (dates.length > 0) {
                for (let i = 0; i < dates.length; i++) {
                    let oldDepartDate = dates[i][0];
                    let oldArriveDate = dates[i][1];
                    // if depart date in old trip range, or arrival date in old trip range, reject.
                    if ((departureDate.getTime() >= oldDepartDate && departureDate.getTime() <= oldArriveDate) || (arrivalDate.getTime() >= oldDepartDate && arrivalDate.getTime() <= oldArriveDate)) {
                        flag = true;

                    };
                };
            };
            //push into saved dates when valid
            if (flag == true) {
                alert('You have entered an invalid date, trips cannot overlap. Please try again.')
                document.getElementById('departureDate').value = '';
            } else {
                dates.push([departureDate.getTime(), arrivalDate.getTime()]);


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

                //now that we have all our data stored in variables, dynamically create travel plan item
                let myTrip = document.createElement('div');
                tripCount = tripCount + 1
                myTrip.setAttribute('class', 'myTrip');
                myTrip.setAttribute('id', `trip${tripCount}`)

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
                departDetails.innerText = `Departing: ${startDate}`;
                detailsDiv.appendChild(departDetails);

                let arriveDetails = document.createElement('h4');
                arriveDetails.innerText = `Arriving: ${endDate}`;
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


                // if within a week from now, give current weather forecast
                if (daysDifference <= 7) {
                    let weatherBitURL = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${long}` + weatherBitKey;
                    const weatherData = await getDataFromServer(weatherBitURL);
                    let temp = weatherData.data[0].temp;

                    tempDetails.innerText = `Current temperature: ${temp}°C`;

                    let clouds = weatherData.data[0].clouds;
                    //if clouds>50, mostly cloudy through the day, else mostly clear through the day
                    if (clouds >= 50) {
                        cloudDetails.innerText = 'Mostly cloudy throughout the day'
                    } else {
                        cloudDetails.innerText = 'Mostly clear throughout the day'
                    };

                }   // else if trip is 8 to 16 days away, use predicted forecast
                else if (daysDifference <= 16) {
                    let weatherBitURL = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${long}` + weatherBitKey;
                    const weatherData = await getDataFromServer(weatherBitURL);
                    console.log(weatherData.data[daysDifference - 1]);
                    let highTemp = weatherData.data[daysDifference - 1].high_temp;
                    let lowTemp = weatherData.data[daysDifference - 1].low_temp;

                    tempDetails.innerText = `High: ${highTemp}°C, Low: ${lowTemp}°C`

                    let clouds = weatherData.data[daysDifference - 1].clouds;
                    //if clouds>50, mostly cloudy through the day, else mostly clear through the day
                    if (clouds >= 50) {
                        cloudDetails.innerText = 'Mostly cloudy throughout the day'
                    } else {
                        cloudDetails.innerText = 'Mostly clear throughout the day'
                    };

                } else {
                    //cannot predict weather more than 16 days ahead
                    tempDetails.innerText = 'Weather cannot be forecasted for trips more than 16 days later!'

                }

                detailsDiv.appendChild(tempDetails);
                detailsDiv.appendChild(cloudDetails);
                myTrip.appendChild(detailsDiv);


                //create buttons div
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


                let newestItemID = myTrip.getAttribute('id');
                console.log(newestItemID);

                let tripItem = { trip: myTrip, daysDiff: daysDifference };
                tripList.push(tripItem);
                //let the first trip planned to pass through
                if (tripList.length > 0) {


                    mySort(tripList);


                  

                    // //sort trip list for nearest to furthest away trips
                    // tripList.sort(function (dayDiff1, dayDiff2) {
                    //     return dayDiff1.daysDiff - dayDiff2.daysDiff;
                    // });

                    //set div's inner html to '' to clear the div
                    document.getElementById('trips').innerHTML = '';

                    //fill up trips html in correct order
                    for (let item of tripList) {
                        document.getElementById('trips').appendChild(item.trip);
                    }

                } else {
                    document.getElementById('trips').appendChild(myTrip);
                };

                let newestTrip = document.getElementById(newestItemID);
                newestTrip.scrollIntoView(true);


                //create remove button that removes whole node out of the tripList database.
                let removeButton = document.createElement('button');
                removeButton.setAttribute('class', 'pdfButton');
                let removeIcon = document.createElement('i');
                removeIcon.setAttribute('class', 'far fa-trash-alt');
                removeButton.appendChild(removeIcon);
                removeButton.addEventListener('click', function () {
                    //remove date from taken dates, if taken
                    for (let i = 0; i < dates.length; i++) {
                        if (dates[i][0] == departureDate.getTime() && dates[i][1] == arrivalDate.getTime()) {
                            let removeIndex = i;
                            dates.splice(removeIndex, 1);
                        }
                    }


                    //remove node from tripList
                    let myIndex = tripList.indexOf(tripItem);
                    tripList.splice(myIndex, 1);

                    console.log(tripList);

                    //after removing, re-sort and redisplay
                    if (tripList.length > 0) {


                        //set div's inner html to '' to clear the div
                        document.getElementById('trips').innerHTML = '';

                        //fill up trips html in correct order
                        for (let item of tripList) {
                            document.getElementById('trips').appendChild(item.trip);
                        }

                    } else {
                        // document.getElementById('trips').appendChild(myTrip);
                        document.getElementById('trips').innerHTML = '';
                    };
                });

                buttonsDiv.appendChild(removeButton);
                document.getElementById(`trip${tripCount}`).appendChild(buttonsDiv);

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
