function mySort(myArray){
    myArray.sort(function(dayDiff1,dayDiff2){
        return dayDiff1.daysDiff - dayDiff2.daysDiff;
    })
}

export{mySort};