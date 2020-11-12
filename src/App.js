import React, {useState, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css'

import './App.css';
import {faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons';

import FileSearch from "./components/FileSearch/FileSearch";
import FileList from "./components/FileList/FileList";
import defaultFiles from "./components/FileList/defaultFiles"
import BottomBtn from "./components/BottomBtn/BottomBtn";
import TableList from "./components/TableList/TableList";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

function App() {

    const [files, setFiles] = useState(defaultFiles);
    const [activeFileID, setActiveFileID] = useState('');
    const [openedFileIDs, setOpenedFileIDs] = useState([]);
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
    let opendFiles = openedFileIDs.map(openId => {
        return files.find((file) => {
            return openId === file.id
        })

    })

    let activeFile = files.find(file => {
        return file.id === activeFileID
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
    const fileChange = (value) => {
        //更新未保存列表
        setUnsavedFileIDs([...unsavedFileIDs, activeFileID])

        //更新文件列表数据
        const newFiles = files.map(file => {
            if (file.id === activeFileID) {
                file.body = value
            }
            return file
        })
        setFiles(newFiles)


    }

    const fileDelete = (fileID) => {
        console.log(fileID, activeFileID)
        let newFiles = files.filter(item => item.id !== fileID);
        //关闭已经打开的tab
        if (openedFileIDs.includes(fileID)) {
            tabClose(fileID)
        }
        setFiles(newFiles)

    }
    const saveEdit = (fileID, value) => {

        let newFiles=files.map(file=>{
            if (file.id===fileID){
                file.title=value
            }
            return file
        })

        console.log(newFiles)
        setFiles(newFiles)

    }

    const updateName = (fileID) => {

    }

    useEffect(() => {

    },)


    return (
        <div className="App container-fluid px-0" style={{'minWidth': '1200px'}}>
            <div className="row no-gutters">
                <div className="col-3 left-panel ">
                    <FileSearch
                        title={'我的云文档'}
                        onFileSearch={(value) => {
                        }}
                    />
                    <FileList
                        files={files}
                        onFileClick={filesItemClick}
                        onSaveEdit={saveEdit}
                        onFileDelete={fileDelete}

                    />
                    <div className="row no-gutters bottom-btn">
                        <div className="col">
                            <BottomBtn
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
                    </>
                    }

                </div>
            </div>
        </div>
    );
}

export default App;
