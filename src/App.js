import React, {useState, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import {v4} from 'uuid'
import './App.css';
import {faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons';

import FileSearch from "./components/FileSearch/FileSearch";
import FileList from "./components/FileList/FileList";
import defaultFiles from "./utils/defaultFiles"
import BottomBtn from "./components/BottomBtn/BottomBtn";
import TableList from "./components/TableList/TableList";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

import {flattenArr, objToArr} from './utils/helper'
import fileHelper from "./utils/fileHelpers";


const {path} = window.require('fs');
const {remote} = window.require('electron');


function App() {

    const [files, setFiles] = useState(flattenArr(defaultFiles));
    const [activeFileID, setActiveFileID] = useState('');
    const [openedFileIDs, setOpenedFileIDs] = useState([]);
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
    const [searchFiles, setSearchFiles] = useState([])
    const filesArr = objToArr(files)
    const savedLocation = remote.app.getPath('documents');
    const fileListArray = searchFiles.length ? searchFiles : filesArr;
    let activeFile = files[activeFileID]

    let opendFiles = openedFileIDs.map(openId => {
        return files[openId]
    })

    const filesItemClick = (fileID) => {
        setActiveFileID(fileID)
        !openedFileIDs.includes(fileID) && setOpenedFileIDs([...openedFileIDs, fileID])
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

    const getFilePath = (name) => {
        return savedLocation + '/' + name + '.md'
    }
    const _changeFiles = (type, contrastID, value) => {
        const newFiles = Object.assign({}, files)

        //  修改 || 如果是新增，添加文件
        if (newFiles[contrastID]['isNew']) {
            delete newFiles[contrastID]['isNew']
            // fileHelper.readFile(path.join(__dirname,'main.js')).then(res=>{
            //     console.log('read file success',res)
            // })
            // fileHelper.whiteFile(getFilePath(value), newFiles[contrastID].body).then(() => {
            //     console.log('新增文件成功')
            //     setFiles(newFiles)
            // })
        }else if(type==='body'){

        }else{
             // fileHelper.renameFile(getFilePath(newFiles[contrastID].title), getFilePath(value)).then(() => {
             //        setFiles(newFiles)
             //    })
        }
        newFiles[contrastID][type] = value



    }
    //搜索列表
    const fileSearch = (keyword) => {
        //filter数组
        const newFiles = filesArr.filter(file => file.title.includes(keyword))
        setSearchFiles(newFiles)
    }

    const fileChange = (value) => {
        //更新未保存列表
        setUnsavedFileIDs([...unsavedFileIDs, activeFileID])

        //更新文件列表数据
        _changeFiles('body', activeFileID, value)

    }

    const fileDelete = (fileID) => {
        console.log(fileID, activeFileID)
        delete files[fileID]
        //关闭已经打开的tab
        if (openedFileIDs.includes(fileID)) {
            tabClose(fileID)
        }
        setFiles(files)

    }
    const updateFileName = (fileID, value, isNew) => {
        _changeFiles('title', fileID, value)
    }
    // onSaveCurrentFile
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

    const onSaveCurrentFile=()=>{

        // fileHelper.whiteFile(getFilePath(activeFile.title),activeFile.body).then(() => {
        //    // 完成保存，删除unsavedID
        //
        //     let newUnsavedFileIDs=unsavedFileIDs.filter(file=>file!==activeFile.id)
        //     setUnsavedFileIDs(newUnsavedFileIDs)
        // })
    }
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
                            onChange={(value) => {
                                fileChange(value)
                            }}
                            value={activeFile && activeFile.body}
                            options={
                                {
                                    minHeight: '515px'
                                }
                            }
                        />

                        <BottomBtn
                            text='保存'
                            colorClass='btn-warning'
                            icon={faFileImport}
                            onBtnClick={onSaveCurrentFile}
                        />
                    </>
                    }

                </div>
            </div>
        </div>
    );
}

export default App;
