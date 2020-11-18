const qiniu = require('qiniu');

const accessKey = '9ntn8WlDdHrwFKLlYJ26A3vwJkEpvJQpfg0E41wd';
const secretKey = 'DPskeWKxHmsZP2DirZNmn-Aae8MB6H8QJIl_0V2u';

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const config = new qiniu.conf.Config();
const bucketManager = new qiniu.rs.BucketManager(mac, config);
const publicBucketDomain = 'http://qjyysd0kq.hd-bkt.clouddn.com';
const key='NAME1.md';

// 公开空间访问链接
const publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key);
console.log(publicDownloadUrl);
