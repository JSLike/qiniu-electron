import {useEffect} from "react";

const {ipcRenderer} = window.require('electron');

const useIpcRenderer = (keyCallbackMap) => {

    let mapFn = (event) => {
        Object.keys(keyCallbackMap).forEach(key => {
            if (keyCallbackMap[key] && keyCallbackMap[key] instanceof Function) {
                ipcRenderer[event](key, keyCallbackMap[key])
            }
        })
    }
    useEffect(() => {
        mapFn('on')
        return () => {
            mapFn('removeListener')
        }
    })

}


export default useIpcRenderer
