import React, {useState, useEffect, useRef} from 'react';

import PropTypes from 'prop-types'
import classnames from  'classnames';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from '@fortawesome/free-solid-svg-icons';

import './TableList.scss'

const TableList = (props) => {
    const {files, activeId, unSaveIds, onTabClick, onCloseTab} = props;


    return (
        <ul className="nav nav-pills tablist-component">
            {
                files.map(file => {
                    const withUnSavedMark=unSaveIds.includes(file.id);
                    const classes=classnames('nav-link',{
                        'active':file.id===activeId,
                        'withUnsaved':withUnSavedMark
                    })
                    return (
                        <li className="nav-item" key={file.id}>
                            <a href="#"
                               className={classes}
                               onClick={
                                   (e)=>{
                                      e.preventDefault();
                                       onTabClick(file.id)
                                   }
                               }
                            >
                                <span>
                                         {file.title}
                                </span>
                                <FontAwesomeIcon
                                    onClick={(e)=>{
                                        e.preventDefault();
                                        e.stopPropagation()
                                        onCloseTab(file.id)
                                    }}
                                    className='ml-2 close-icon'
                                    title={'关闭'}
                                    icon={faTimes}
                                />
                                {
                                    withUnSavedMark&&<span className='ml-2 rounded-circle unsaved-icon'/>
                                }

                            </a>
                        </li>
                    )
                })
            }
        </ul>
    )

}
TableList.propsTypes = {
    files: PropTypes.array,
    activeId: PropTypes.string,
    unSaveIds: PropTypes.array,
    onTabClick: PropTypes.func,
    onCloseTab: PropTypes.func,
}
TableList.defaultProps = {
    files: [],
    unSaveIds: []
}
export default TableList
