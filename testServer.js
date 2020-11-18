const fs = require('fs');


//_______________创建超大文件
// for (let x = 0; x < 100; x++) {
//
//     let data = [];
//     for (let y = 0; y < 100000; y++) {
//         data.push({
//             name: 'like',
//             age: 'like',
//             A: 'like',
//             B: 'like',
//             C: 'like',
//         })
//     }
//     data = JSON.stringify(data)
//     fs.appendFile('./bigFile.md', data, (err) => {
//         if (err) {
//             console.log('发生错误', err)
//             return
//         }
//         console.log('写入成功')
//     })
//
// }

//检测内存
let bigFile='./bigFile.md'
const server = require('http').createServer();

server.on('request', (req, res) => {
    const src =fs.createReadStream(bigFile)
    console.log(res)
    src.pipe(res)
    // fs.readFile(bigFile,(err,data)=>{
    //     if(err) throw err;
    //     res.end(data)
    // })
})
server.listen(8000)
