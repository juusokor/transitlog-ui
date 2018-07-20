function takeEveryNth(arr, nth) {
  const takenArr = [];

  for (let i = 0; i < arr.length; i = i + nth) {
    takenArr.push(arr[i]);
  }

  return takenArr;
}

export default takeEveryNth;
