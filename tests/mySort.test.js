import {mySort} from '../src/client/js/mySort.js';


describe('Client-side sort test', ()=>{
  it('should test that isSorted is true after sorting', () =>{
    let testArray = [
      {trip:'c',daysDiff:3},
      {trip:'a',daysDiff:1},
      {trip:'b',daysDiff:2}
    ];
  
    let sortedArray =[
      {trip:'a',daysDiff:1},
      {trip:'b',daysDiff:2},
      {trip:'c',daysDiff:3}
    ];
  
    mySort(testArray); 
    let isSorted = (JSON.stringify(testArray) === JSON.stringify(sortedArray));
  
    expect(isSorted).toBe(true);
  })
})



