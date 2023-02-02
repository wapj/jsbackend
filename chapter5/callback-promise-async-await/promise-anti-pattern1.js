function myWork(work) {
    return new Promise((resolve, reject) => {
        if (work === 'done') {
            resolve('게임 가능');
        } else {
            reject(new Error("게임 불가능"));
        }
    })
}

myWork('done').then(function (value) { console.log(value) }, function (err) { console.error(err) });

myWork('doing')
    .then(function (value) { console.log(value) })
    .catch(function (err) { console.error(err) });