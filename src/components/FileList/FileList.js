import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import {faEdit, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';

import {faMarkdown} from '@fortawesome/free-brands-svg-icons';


const FileList = ({files, onFileClick, onSaveEdit, onFileDelete}) => {
    return (

        <ul className='list-group'>
            {
                files.map(file => {
                    return (
                        <li className='list-group-item row bg-light d-flex align-items-center file-item'
                            key={file.id}
                        >
                            <div  className='col-8'>
                                <FontAwesomeIcon

                                    title={'markdown'}
                                    icon={faMarkdown}
                                />
                                <span className='pl-3'>{file.title}</span>
                            </div>

                            <div className='col-4 pr-0 d-flex justify-content-end'>
                                <button
                                    type='button'
                                    className='icon-button'
                                    onClick={()=>{}}
                                >
                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        title='编辑'
                                        size='lg'
                                    />
                                </button>

                                <button
                                    type='button'
                                    className='icon-button'
                                    onClick={()=>{}}

                                >
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        title='删除'
                                        size='lg'
                                    />
                                </button>
                            </div>

                        </li>
                    )
                })
            }
        </ul>

    )
}
FileList.propsTypes={
    file:PropTypes.array
}
export default FileList
