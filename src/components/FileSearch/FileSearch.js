import React, {useState, useEffect, useRef} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch, faTimes} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import useKeyPress from "../../hooks/useKeyPress";

const FileSearch = ({title, onFileSearch}) => {
    const [inputActive, setInputActive] = useState(false);
    const [value, setValue] = useState('');
    const enterPressed = useKeyPress('Enter')
    const escPressed = useKeyPress('Escape')

    let node = useRef(null);

//————————————————————————
    let num = useRef(0)
    num.current++
    console.log('FileSearch-num-end,',num.current)
//————————————————————————

    const closeSearch = () => {
        setInputActive(false);
        setValue('')
        onFileSearch('')
    }

    useEffect(() => {
        if (enterPressed && inputActive) {
            onFileSearch(value)
        } else if (escPressed && inputActive) {
            closeSearch()
        }

    },[enterPressed,escPressed])
    useEffect(() => {
        if (node.current && inputActive) {
            node.current.focus()
        }
    }, [inputActive])

    return (
        <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0"
             style={{height: '50px'}}
        >
            {
                !inputActive &&
                <>
                    <span>{title}</span>
                    <button
                        type='button'
                        className='icon-button'
                        onClick={() => {
                            setInputActive(true)
                        }}
                    >

                        <FontAwesomeIcon
                            icon={faSearch}
                            title='搜索'
                            size='lg'
                        />
                    </button>
                </>
            }
            {
                inputActive &&
                <>
                    <input type="text" className='form-control '
                           value={value}
                           onChange={(e) => setValue(e.target.value)}
                           ref={node}
                    />
                    <button
                        type='button'
                        className='icon-button'
                        onClick={closeSearch}
                    >
                        <FontAwesomeIcon
                            icon={faTimes}
                            title='关闭'
                            size='lg'
                        />
                    </button>
                </>
            }

        </div>
    )

}

FileSearch.propTypes = {
    title: PropTypes.string,
    onFileSearch: PropTypes.func.isRequired
}
FileSearch.defaultProps = {
    title: '我的云文档'
}


export default FileSearch
