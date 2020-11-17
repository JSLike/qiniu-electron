import {useEffect, useRef} from "react";

const {remote} = window.require('electron');
const {Menu, MenuItem} = remote


const useContextMenu = (itemArr, targetSelector,deps) => {
    let clickedElement = useRef(null);
    useEffect(() => {
        const menu = new Menu()
        itemArr.forEach(item => {
            menu.append(new MenuItem(item))
        })
        let menuEventListener = (e) => {
            //只有e.target是被targetSelector包裹的组件时才会触发
            if ( document.querySelector(targetSelector).contains(e.target)){
                clickedElement.current = e.target;
                e.preventDefault()
                menu.popup({window: remote.getCurrentWindow()})//获取当前的window，并popup弹出
            }

        }
        window.addEventListener('contextmenu', menuEventListener, false)
        return () => {
            window.removeEventListener('contextmenu', menuEventListener)
        }
    },deps)
    return clickedElement
}

export {useContextMenu}







