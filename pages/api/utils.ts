import { ISM64Material } from "./types"
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const rgbToHex = ( hex: number, prefix = "#" ) => {
    return `${prefix}${hex.toString(16).padStart(6, "0")}`
}

const materialToHex = ( material: ISM64Material, prefix = "#" ) => {
    return {
        color:   `${prefix}${material.color.toString(16).padStart(6, "0")}`,
        ambient: `${prefix}${material.ambient.toString(16).padStart(6, "0")}`
    }
}

const materialToGS = ( material: ISM64Material ) => {
    let color    = `${material.color.toString(16).padStart(6, "0")}`
    let ambient  = `${material.ambient.toString(16).padStart(6, "0")}`
    let slice = (array: string, start: number, end: number) => array.substring(start, end).toUpperCase()
    return {
        color:   [
            slice(color, 0, 2) + slice(color, 2, 4),
            slice(color, 4, 6) + '00'
        ],
        ambient: [
            slice(ambient, 0, 2) + slice(ambient, 2, 4),
            slice(ambient, 4, 6) + '00'
        ]
    }
}

const igltf = (path: string): Promise<GLTF> => {
    const loader = new GLTFLoader()

    return new Promise((resolve, reject) => {
        loader.load( path, ( gltf ) => {
            resolve(gltf)
        }, undefined, ( error ) => {
            reject( error )
        })
    })
}

const copyToClipboard = (textToCopy: string) => {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        // navigator clipboard api method'
        return navigator.clipboard.writeText(textToCopy);
    } else {
        // text area method
        let textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        // make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((res, rej) => {
            // here the magic happens
            document.execCommand('copy') ? res(undefined) : rej();
            textArea.remove();
        });
    }
}

const hexToRgb = (color: number) => {
    return {
        r: (color >> 16) & 255,
        g: (color >> 8) & 255,
        b: color & 255
    }
}

const componentToHex = (c: number) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

const rgbColorToHex = (r: number, g: number, b: number) => {
    return parseInt("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b), 16);
}


export { rgbToHex, materialToHex, materialToGS, igltf, copyToClipboard, hexToRgb, rgbColorToHex }