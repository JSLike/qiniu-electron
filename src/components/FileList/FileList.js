import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {faMarkdown} from '@fortawesome/free-brands-svg-icons';
import useKeyPress from "../../hooks/useKeyPress";

import {useContextMenu} from "../../hooks/useContextMenu";
import {getParentNode} from "../../utils/helper";

const FileList = ({files, onFileClick, onSaveEdit, onFileDelete}) => {

    const [value, setValue] = useState('');
    const [editState, setEditState] = useState(false);
    const enterPressed = useKeyPress('Enter')
    const escPressed = useKeyPress('Escape')
    const inputNode = useRef(null)

    const onEditList = (id,title) => {
        setValue(title)
        setEditState(id)
    }
    const onCloseSearch = (editItem) => {
        //有isNEW属性，则删除
        if (editItem.isNew) {
            onFileDelete(editItem.id)
        }
        setEditState(false)
        setValue('')
    }
    //create context menu

    let clickedElement=useContextMenu([
        {
            label: '打开',
            click() {
                const parentElement =getParentNode(clickedElement.current,'file-item')
                let {id}=parentElement.dataset
                if (parentElement){
                    onFileClick(id)
                }
            }
        },
        {
            label: '重命名',
            click() {
                const parentElement =getParentNode(clickedElement.current,'file-item')
                let {id,title}=parentElement.dataset
                if (parentElement){
                    onEditList(id,title)
                }

            }
        },
        {
            label: '删除',
            click() {
                const parentElement =getParentNode(clickedElement.current,'file-item')
                let {id}=parentElement.dataset
                if (parentElement){
                    onFileDelete(id)
                }
            }
        }
    ],'.file-list',[files])
    useEffect(() => {
        const editItem = files.find(file => file.id === editState)

        if (editState && enterPressed && value.trim()) {
            //确认修改逻辑
            onSaveEdit(editItem.id, value)
            onCloseSearch(editItem) //enter，esc hooks过滤了其他按键的可能性，所以可以直接关闭
        } else if (editState && escPressed) {
            onCloseSearch(editItem)
        }

    }, [enterPressed, escPressed])


    useEffect(() => {
        const newFile = files.find(file => {
            return file.isNew
        })
        if (newFile) {
            setEditState(newFile.id);
            setValue(newFile.title)
        }


    }, [files])

    return (

        <ul className='list-group file-list'>
            {
                files.map(file => {
                    return (
                        <li className='list-group-item row bg-light d-flex align-items-center file-item mx-0'
                            key={file.id}
                            id={file.id}
                            data-id={file.id}
                            data-title={file.title}
                            data-file={file}
                        >
                            {(file.id === editState || file.isNew) ?
                                <input type="text" className='form-control col-8'
                                       value={value}
                                       onChange={(e) => setValue(e.target.value)}
                                       ref={inputNode}
                                       placeholder='请输入文件名称'
                                />
                                :
                                <div className='col-8'>
                                    <FontAwesomeIcon
                                        title={'markdown'}
                                        icon={faMarkdown}
                                    />

                                    <span
                                        className='pl-3 pointer-event '
                                        style={{cursor: 'pointer'}}
                                        onClick={() => {
                                            onFileClick(file.id)
                                        }}
                                    >
                                        {file.title}
                                    </span>
                                </div>
                            }


                            <div className='col-4 pr-0 d-flex justify-content-end'>
                                {(file.id !== editState && !file.isNew) ? (
                                    <>
                                        {/*<button*/}
                                        {/*    type='button'*/}
                                        {/*    className='icon-button'*/}
                                        {/*    onClick={() => onEditList(file.id,file.title)}*/}
                                        {/*>*/}
                                        {/*    <FontAwesomeIcon*/}
                                        {/*        icon={faEdit}*/}
                                        {/*        title='编辑'*/}
                                        {/*        size='lg'*/}
                                        {/*    />*/}
                                        {/*</button>*/}

                                        {/*<button*/}
                                        {/*    type='button'*/}
                                        {/*    className='icon-button'*/}
                                        {/*    onClick={() => {*/}
                                        {/*        onFileDelete(file.id)*/}
                                        {/*    }}*/}

                                        {/*>*/}
                                        {/*    <FontAwesomeIcon*/}
                                        {/*        icon={faTrash}*/}
                                        {/*        title='删除'*/}
                                        {/*        size='lg'*/}
                                        {/*    />*/}
                                        {/*</button>*/}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className="icon-button"
                                            onClick={() => {
                                                onCloseSearch(file)
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                title="关闭"
                                                size="lg"
                                                icon={faTimes}
                                            />
                                        </button>
                                    </>

                                )}
                            </div>


                        </li>
                    )
                })
            }
        </ul>

    )
}
FileList.propsTypes = {
    file: PropTypes.array
}
export default FileList
