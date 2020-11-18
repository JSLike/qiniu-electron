const QiniuManager =require('./src/utils/QiniuManager');


const accessKey = '9ntn8WlDdHrwFKLlYJ26A3vwJkEpvJQpfg0E41wd';
const secretKey = 'DPskeWKxHmsZP2DirZNmn-Aae8MB6H8QJIl_0V2u';
//create uploadToken
const bucket = 'like-electron';


const localFile = "F:\\Learn\\Electron\\qi-niu-yun\\react-with-electron\\public\\mda-kkgv6xzd77urvy4x.mp4";    //本地地址
// 扩展参数
let putExtraObj={
    params : {
        "x:name": "",
        "x:age": 27,
    },
    fname : 'NoN',
    // 如果指定了断点记录文件，那么下次会从指定的该文件尝试读取上次上传的进度，以实现断点续传
    resumeRecordFile : 'progress.log'
}
const key = 'movie.md';   //上传完成文件名

let Manager=new QiniuManager(accessKey,secretKey,bucket)

// Manager.uploadFile(key,localFile,putExtraObj)

// Manager.deleteFile('textAB.md').then(res=>{
//     console.log('res--->',res)
// }).catch(err=>{
//     console.log('err--->',err)
// })
// Manager.getBucketDomain().then(res=>{
//     console.log(res)
//     let {statusCode,respBody}=res;
//
// }).catch(err=>{
//     console.log(err)
// })


Manager.generateDownloadLink("bucket1111231LIKE").then(res=>{
    console.log('up----',res)
})
