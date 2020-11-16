
export const flattenArr =(arr)=>{
    return arr.reduce((map,item)=>{
        map[item.id]=item;
        return map
    },{})
}

export const objToArr = (obj) =>{
    return Object.keys(obj).map(key=>obj[key])
}



export const fileStoreObj=(files)=>{
    //建立储存目录文件
    return objToArr(files).reduce((result,file)=>{
        const {id,title,path,createdAt}=file;
        result[id]={
            id,
            title,
            path,
            createdAt
        }
        return result
    },{})

}



//获取父节点
export const getParentNode=(node,parentClassName)=>{
    let current =node;
    while(current !== null){
        if (current.classList.contains(parentClassName)){
            return current
        }
        current =current.parentNode
    }
    return false

}

