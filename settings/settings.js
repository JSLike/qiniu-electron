const {remote,ipcRenderer} = require('electron');
const Store = require('electron-store');
const settingsStore = new Store({name: 'Settings'})
const qiniuConfigArr = ['#savedFileLocation', '#accessKey', '#secretKey', '#bucketName']


const $ = (selector) => {
    const result = document.querySelectorAll(selector)
    return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {
    let savedLocation = settingsStore.get('savedFileLocation') || '';
    if (savedLocation) {
        $('#savedFileLocation').value = savedLocation
    }
    qiniuConfigArr.forEach(selector=>{
        const savedValue=settingsStore.get(selector.substr(1));
        if (savedValue){
            $(selector).value=savedValue
        }
    })

    $('#select-new-location').addEventListener('click', () => {
        remote.dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory '],
            message: '选择文件的储存路径',
            securityScopedBookmarks: true
        }).then(res => {
            console.log(res)
            let {canceled, filePaths} = res
            if (!canceled) {
                $('#savedFileLocation').value = filePaths[0]
            }
        })
    })

    //表单提交
    $('#settings-form').addEventListener('submit', (e) => {
        try {
            e.preventDefault();
            qiniuConfigArr.forEach(selector => {
                if ($(selector)) {
                    let {id, value} = $(selector);
                    console.error(id, value)
                    settingsStore.set(id, value ? value : '')
                }
            })
            //send a event back to main process to enable menu items if qinniu is configed
            ipcRenderer.send('config-is-saved')
            // remote.getCurrentWindow().close()
        } catch (err) {
            console.log('error---',err)

        }
    })
    $('.nav-tabs').addEventListener('click', (e) => {
        e.preventDefault()
        $('.nav-link').forEach(element => {
            element.classList.remove('active')
        })
        e.target.classList.add('active')
        $('.config-area').forEach(element => {
            element.style.display = 'none'
        })
        $(e.target.dataset.tab).style.display = 'block'
    })







})


