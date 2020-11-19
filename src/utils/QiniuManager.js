const qiniu = require('qiniu');
const fs = require('fs')
const axios = require('axios');

class QiniuManager {
    constructor(accessKey, secretKey, bucket) {
        //generate mac
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        this.bucket = bucket;
        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;
        // 是否使用https域名
        // config.useHttpsDomain = true;
        // 上传是否使用cdn加速
        //config.useCdnDomain = true;

        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);

        //自定义变量
        this.publicBucketDomain = null
    }

    _handleCallBack(resolve, reject) {
        return (err, respBody, respInfo) => {
            let message = {
                statusCode: respInfo.statusCode,
                respBody: respBody
            }
            if (err) {
                throw err;
            }
            if (respInfo.statusCode === 200) {
                resolve(message)
            } else {
                reject(message)
            }
        }
    }

    //获取bucket域
    getBucketDomain() {
        const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`;
        const digest = qiniu.util.generateAccessToken(this.mac, reqURL);
        return new Promise((resolve, reject) => {
            qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallBack(resolve, reject))
        })
    }

    //获取文件地址
    generateDownloadLink(key) {
        //已请求过，则使用请求到的数据，否则请求获取
        const domainPromise = this.publicBucketDomain ?
            Promise.resolve({respBody: [this.publicBucketDomain]}) : this.getBucketDomain();
        return domainPromise.then(res => {
            console.log(res)
            let data = res.respBody
            if (Array.isArray(data) && data.length > 0) {
                const pattern = /^https?/;
                //正则匹配到前缀，直接则使用：否则加上http前缀
                this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
                return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key)
            } else {
                throw Error('域名未找到，请查看储存空间是否过期')
            }
        })


    }


    //上传
    uploadFile(key, localFilePath, putExtraObj) {
        const options = {
            scope: this.bucket + ':' + key,
        };
        //uploadToke
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(this.mac);
        //
        const resumeUploader = new qiniu.resume_up.ResumeUploader(this.config);
        const putExtra = new qiniu.resume_up.PutExtra();
        //合并额外参数

        if (putExtraObj && Object.prototype.toString.call(putExtraObj) === '[object Object]') {
            Object.keys(putExtraObj).forEach(item => {
                putExtra[item] = putExtraObj[item]
            })
        }
        //上传
        return new Promise((resolve, reject) => {
            resumeUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallBack(resolve, reject));
        })
    }


    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(this.bucket, key, this._handleCallBack(resolve, reject));
        })

    }

    //下载文件
    downloadFile(key, downloadPath) {
        //step 1 get the download link
        //step 2 send the request to download link , return a readable stream
        //step 3 create a writable stream and pipe to it
        //step 4 return a promise based result
        return this.generateDownloadLink(key).then(link => {
            console.log('downlink---', link)
            const timeStrap = new Date().getTime();
            const url = `${link}?timeStrap=${timeStrap}`
            return axios({
                url,
                method: 'GET',
                responseType: 'stream',//以流式数据返回
                headers: {'Cache-Control': 'no-cache'}//不缓存
            }).then(response => {
                //创建可写流，指定本地储存路径
                const writer = fs.createWriteStream(downloadPath);
                response.data.pipe(writer)

                // console.log('downloadPath------', downloadPath)
                // console.log('response------', response.data)
                // console.log('writer------', writer)

                return new Promise((resolve, reject) => {
                    writer.on('finish', resolve)
                    writer.on('error', reject)
                })

            }).catch(err => {
                return Promise.reject({err: err.response})
            })
        })
    }


    getStat(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.stat(this.bucket, key, this._handleCallBack(resolve,reject));
        })
    }


}

module.exports = QiniuManager
