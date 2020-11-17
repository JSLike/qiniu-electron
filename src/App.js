import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import {v4} from 'uuid'
import './App.css';
import {faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons';

import FileSearch from "./components/FileSearch/FileSearch";
import FileList from "./components/FileList/FileList";

import BottomBtn from "./components/BottomBtn/BottomBtn";
import TableList from "./components/TableList/TableList";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

import {flattenArr, objToArr, fileStoreObj} from './utils/helper'
import fileHelper from "./utils/fileHelpers";
import useIpcRenderer from './hooks/useIpcRenderer';

const {remote, ipcRenderer} = window.require('electron');
const path = window.require('path')
const Store = window.require('electron-store');
const fileStore = new Store({'name': 'File Data'})
const settingsStore=new Store({name:'Settings'})
const savedLocation =settingsStore.get('savedFileLocation')|| remote.app.getPath('documents');
console.warn(savedLocation)
// console.log('files---',fileStore.get('files'),remote.app.getPath('userData'))
function App() {

    const [files, setFiles] = useState(fileStore.get('files') || {});
    const [activeFileID, setActiveFileID] = useState('');
    const [openedFileIDs, setOpenedFileIDs] = useState([]);
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
    const [searchFiles, setSearchFiles] = useState([])
    const filesArr = objToArr(files)
    const fileListArray = searchFiles.length ? searchFiles : filesArr;
    let activeFile = files[activeFileID]
    console.log('data-path----', savedLocation, remote.app.getPath('userData'))

    const saveFilesToStore = (files) => {
        let fileObj = fileStoreObj(files)
        fileStore.set('files', fileObj)
    }
    let opendFiles = openedFileIDs.map(openId => {
        return files[openId]
    })

    //delete file
    const fileDelete = (fileID) => {
        // let newFile = {...files}
        const {[fileID]: value, ...afterDelete} = files;//es6展开法

        if (files[fileID].isNew) {
            // delete newFile[fileID]
            setFiles(afterDelete)
        } else {
            fileHelper.deleteFile(files[fileID].path).then(() => {
                // delete newFile[fileID]
                saveFilesToStore(afterDelete)
                //关闭已经打开的tab
                if (openedFileIDs.includes(fileID)) {
                    tabClose(fileID)
                }
                setFiles(afterDelete)
            })
        }

    }
    //更新本地文件内容并删除为保存            //初次加载读取不到问题
    const onSaveCurrentFile = () => {
        if (!activeFile || !activeFile.path){
            return
        }
        fileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
            // 完成保存，删除unsavedID
            let newUnsavedFileIDs = unsavedFileIDs.filter(fileId => {
                return fileId !== activeFile.id
            })
            setUnsavedFileIDs(newUnsavedFileIDs)
        })
    }


    //点击打开文件的时候读取内容
    const filesItemClick = (fileID) => {
        let newFile = {...files[fileID]};
        setActiveFileID(fileID)
        !openedFileIDs.includes(fileID) && setOpenedFileIDs([...openedFileIDs, fileID])
        if (!newFile.isLoaded) {
            fileHelper.readFile(newFile.path).then((data) => {
                newFile.body = data;
                newFile.isLoaded = true;
                setFiles({...files, [newFile.id]: newFile})
                setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== fileID))
            }).catch(err => {
                console.error('文件读取失败', err)
            })
        }
    }
    const tabClick = (fileID) => {
        setActiveFileID(fileID)
    }
    const tabClose = (fileID) => {

        let deletedFiles = openedFileIDs.filter(id => id !== fileID);
        setOpenedFileIDs(deletedFiles)
        if (fileID === activeFileID) {
            setActiveFileID(deletedFiles[deletedFiles.length - 1] || '')
        }
        if (unsavedFileIDs.includes(fileID)) {
            //提示未保存，继续则删除UnsavedFileIDs中的id
            let newUnsavedFileIDs = unsavedFileIDs.filter(id => id !== fileID)
            setUnsavedFileIDs(newUnsavedFileIDs)
        }
    }

    const getFilePath = (name, filePath) => {
        if (!filePath) {
            return path.join(savedLocation, name + '.md')
        } else {
            return path.join(path.dirname(filePath), name + '.md')
        }
    }
    const _changeFiles = (type, contrastID, value) => {
        const newFiles = Object.assign({}, files)
        let currentFiles = newFiles[contrastID]
        let isNew = currentFiles['isNew']
        let newPath = isNew ? getFilePath(value) : getFilePath(value, currentFiles.path);
        currentFiles.path = newPath
        let callback = () => {
            currentFiles[type] = value
            setFiles(newFiles)
            saveFilesToStore(newFiles)
        }

        //  修改 || 如果是新增，添加文件
        if (isNew) {
            delete currentFiles['isNew']
            fileHelper.writeFile(newPath, currentFiles.body).then(callback)
        } else {
            const oldPath = getFilePath(currentFiles.title, currentFiles.path);
            fileHelper.renameFile(oldPath, newPath).then(callback)
        }

    }
    //搜索列表
    const fileSearch = (keyword) => {
        //filter数组
        const newFiles = filesArr.filter(file => file.title.includes(keyword))
        setSearchFiles(newFiles)
    }

    const fileChange = (activeFileID, value) => {
        //更新未保存列表--解析文件的时候触发，以至于处于为保存状态
        if (value !== files[activeFileID].body) {
            let newFiles = {
                ...files,
                [activeFileID]: {
                    ...files[activeFileID],
                    body: value
                }
            }
            setFiles(newFiles)
            if (!unsavedFileIDs.includes(activeFileID) && files[activeFileID].isLoaded) {
                setUnsavedFileIDs([...unsavedFileIDs, activeFileID])
            }
        }

    }


    //修改文件名称
    const updateFileName = (fileID, value) => {
        _changeFiles('title', fileID, value)
    }
    //添加文件
    const addNewFile = () => {
        if (filesArr.find(file => file.isNew)) {
            return
        }

        let key = v4()
        const newFiles = {
            ...files,
            [key]: {
                id: key,
                title: '',
                body: '请输入markdown',
                createdAt: new Date().getTime(),
                isNew: true
            }
        }

        setFiles(newFiles)

    }


    //import files
    const importFiles = () => {
        remote.dialog.showOpenDialog({
            title: '选择文件',
            properties: ['openFile', 'multiSelections'],
            defaultPath: savedLocation,
            filters: [
                {name: 'Markdown Files', extensions: ['md']},
            ]
        }).then(res => {
            let {canceled, filePaths} = res;
            if (!canceled) {
                //用户确认
                //1.过滤掉已经添加过的文件 ,并抛出提示

                const newFilePaths = filePaths.filter(filePath => {
                    const hasArr = Object.values(files).find(file => {
                        return file.path === filePath
                    })
                    return !hasArr
                })
                if (!newFilePaths || !newFilePaths.length) {
                    return
                }
                //2.转化成file格式{id,title,body,createdAt}

                const importFilesArr = newFilePaths.map(filePath => {
                    return {
                        id: v4(),
                        title: path.basename(filePath, path.extname(filePath)),
                        path: filePath,
                        createdAt: new Date().getTime()
                    }
                })

                //3.更新files
                const newFiles = {...files, ...flattenArr(importFilesArr)}
                setFiles(newFiles)
                saveFilesToStore(newFiles)

                remote.dialog.showMessageBox({
                    type: 'info',
                    title: '导入文件',
                    message: `成功导入了${importFilesArr.length}个文件`
                })
            }
        }).catch(err => {
            console.log('选择文件失败', err)
        })
    }

    //应用菜单事件
    let objListener = {
        'create-new-file': addNewFile,
        'save-edit-file': onSaveCurrentFile,
        'search-file': fileSearch,
        'import-file': importFiles,

    }
    useIpcRenderer(objListener)


    return (
        <div className="App container-fluid px-0" style={
            {'minWidth': '1200px'}
        }>
            <div className="row no-gutters">
                <div className="col-3 left-panel ">
                    <FileSearch
                        title={'我的云文档'}
                        onFileSearch={fileSearch}
                    />
                    <FileList
                        files={fileListArray}
                        onFileClick={filesItemClick}
                        onSaveEdit={updateFileName}
                        onFileDelete={fileDelete}

                    />
                    <div className="row no-gutters bottom-btn">
                        <div className="col">
                            <BottomBtn
                                onBtnClick={addNewFile}
                                text='新建'
                                colorClass={'btn-primary'}
                                icon={faPlus}
                            />
                        </div>
                        <div className="col">
                            <BottomBtn
                                text='导入'
                                colorClass='btn-success'
                                icon={faFileImport}
                                onBtnClick={importFiles}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-9 right-panel ">

                    {
                        !activeFile &&
                        <div className="start-page">
                            选择或者创建新的markdown文档
                        </div>
                    }

                    {activeFile &&
                    <>
                        <TableList
                            files={opendFiles}
                            onTabClick={tabClick}
                            onCloseTab={tabClose}
                            activeId={activeFileID}
                            unSaveIds={unsavedFileIDs}
                        />
                        <SimpleMDE
                            key={activeFileID}
                            value={activeFile && activeFile.body}
                            onChange={(value) => {
                                fileChange(activeFileID, value)
                            }}
                            options={
                                {
                                    minHeight: '515px'
                                }
                            }
                        />
                    </>
                    }

                </div>
            </div>
        </div>
    );
}

export default App;
