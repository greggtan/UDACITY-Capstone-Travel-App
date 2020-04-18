This project is my Capstone project that is a travel app.

Users are able to enter 1. A city of choice and 2.Date of trip (start to end date). My webapp will take these 2 data as input to dynamically create a travel planner. Data such as duration of trip, start date, end date, days away from today, weather data such as temperature and cloud visibility (<7 days away, give current temp and clouds, 7<temp<17 days away give exact day's high & low temp and clouds, >16 days no weather forecast available).

Validation has been done, such that users must enter a valid city name, a date of travel that is not in the past(at least today), and a date of travel that is not already taken by other plans.

Users are able to export their individual plans as PDF or print them out, and users can also delete any travel plan as they like.

All travels added will be sorted and in chronological order based on how far away the trip is from today (i.e the nearer the trip, the higher up the trip priority).

Step 1: Install all dependencies and packages required
Step 2: "npm start" in terminal, app is hosted on localhost port 4040.
Step 3: Use the app! App is validated for invalid inputs such as invalid city names, invalid dates, overlapping dates etc.
