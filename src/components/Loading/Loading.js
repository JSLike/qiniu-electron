import React from 'react';

import './Loading.scss'


const Loading = (props)=>{
    const {text='处理中'}=props;


    return (
        <div className={'loading-component text-center'}>
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">{text}</span>
            </div>
            <h5 className={'text-primary'}>
                {text}
            </h5>
        </div>

    )

}



export default Loading
