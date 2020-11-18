const fs =require('fs');
const zlib=require('zlib');

const src=fs.createReadStream('./package.json');

const writeDesc=fs.createWriteStream('./test_copyA.md.gz')
src.pipe(zlib.createGzip()).pipe(writeDesc)
