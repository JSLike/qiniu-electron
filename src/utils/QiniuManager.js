const qiniu = require('qiniu');

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
}

module.exports = QiniuManager
