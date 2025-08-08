

import { browser } from '$app/environment'
import { writable, get } from 'svelte/store'
import QRCode from 'qrcode'
import { getRole, getRoleByI } from './Database'
import { isNumber } from './utils'
import { page } from '$app/stores'

export function getUrlWithParams(baseUrl, obj) {
    let paramTexts = []
    for (const key of Object.keys(obj)) {
        paramTexts.push(`${key}=${JSON.stringify(obj[key])}`)
    }
    const queryParams = paramTexts.join('&')
    if (baseUrl.startsWith('/') && browser) {
        baseUrl = window.location.origin + baseUrl
    }
    if (baseUrl.endsWith('?')) {
        return baseUrl + queryParams
    }
    if (baseUrl.endsWith('/')) {
        return baseUrl.substring(0, baseUrl.length - 1) + '?' + queryParams
    }
    return baseUrl + '?' + queryParams
}
export function getFullUrl(baseUrl) {
    if (baseUrl.startsWith('/') && browser) {
        baseUrl = window.location.origin + baseUrl
    }
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1)
    }
    return baseUrl
}
export async function showQR(div, text) {
    if (!browser) {
        throw `Not in browser`
    }
    const qrBase64 = await stringToBase64QRCode(text)
    div.innerHTML = `
        <img class="qr-code" src="${qrBase64}"/>
    `
}
export function getScriptFromURL() {
    if (!browser) {
        throw `Not in browser`
    }
    const params = getURLParams()
    const rolesJSON = params.get('custom-roles')
    if (rolesJSON == null) {
        return []
    }
    const roleIs = JSON.parse(rolesJSON)
    const roleNames = roleIs.map(i => getRoleByI(i))
    const scriptName = params.get('script-name')
    return {
        scriptName,
        roleNames
    }
}
// Use with $page.url (import { page } from '$app/stores')
export function getScriptFromURLSvelte(url) {

    console.log({url})

    if (url?.hash?.length > 3) {
        const [_, qrData] = url.hash.split('#')
        return getScriptFromURLQrDataV2(qrData)
    }

    const hasCustomRoles = url.searchParams.has('custom-roles')
    const hasScriptName = url.searchParams.has('script-name')

    const customRoleIs = hasCustomRoles == false? null: JSON.parse(url.searchParams.get('custom-roles'))
    
    const customRoleNames = customRoleIs?.map(i => getRoleByI(i).name)
    const scriptName = hasScriptName == false? null: JSON.parse(url.searchParams.get('script-name'))

    return {
        scriptName,
        customRoleNames
    }
}
export function getScriptFromURLQrDataV2(qrData) {
    if (qrData == null || qrData.length == 0 || !qrData.includes('--')) {
        return {
            scriptName: null,
            customRoleNames: null
        }
    }
    
    const [scriptName, customRoleIs] = decodeScriptNameAndRoleIs(qrData)
    const customRoleNames = customRoleIs?.map(i => getRoleByI(i)?.name)

    return {
        scriptName,
        customRoleNames
    }
}

export function decodeScriptNameAndRoleIs(qrCode) {
    if (qrCode == null || qrCode.length == 0) {
        return [null, null]
    }
    const [scriptNameRaw, roleIsRaw] = qrCode.split('--')
    if (scriptNameRaw == null || roleIsRaw == null) {
        return [null, null]
    }
    const scriptName = scriptNameRaw.split('_').join(' ').trim()
    const roleIs = roleIsRaw.split('-').map(str => parseInt(str))
    return [scriptName, roleIs]
}
// My_Script--1-2-3-4-5
export function encodeScriptNameAndRoleIs(scriptName, roleIs) {
    const transmittedScriptName = scriptName.split(' ').join('_')
    const transmittedRoleIs = roleIs.map(i => `${i}`).join('-')
    const qrData = `${transmittedScriptName}--${transmittedRoleIs}`
    return qrData
}


export function getURLParams() {
    if (!browser) {
        throw `Not in browser`
    }
    return new URLSearchParams(window.location.search)
}

export async function stringToBase64QRCode(str) {
    const url = await QRCode.toDataURL(str)
    return url
}
if (browser) {
    window.stringToBase64QRCode = stringToBase64QRCode
}

export function hasLocalStorageObject(name) {
    if (browser) {
        return window.localStorage.getItem(name) != null
    }
}
export function getLocalStorageObject(name) {
    if (browser) {
        if (!hasLocalStorageObject(name)) {
            return null
        }
        return JSON.parse(window.localStorage.getItem(name))
    }
}
export function setLocalStorageObject(name, obj) {
    if (browser) {
        window.localStorage.setItem(name, JSON.stringify(obj))
    }
}

export function localStorageWritable(name, defaultValue) {
    const lsValue = getLocalStorageObject(name)
    if (browser) {
        
    }
    const theWritable = writable(hasLocalStorageObject(name) ?  getLocalStorageObject(name) : defaultValue)
    theWritable.subscribe(newWritable => {
        setLocalStorageObject(name, newWritable)
    })

    if (browser) {
        if (window.stores == null) {
            window.stores = {}
        }
        window.stores[name] = { get: () => get(theWritable) }
    }

    return theWritable
}


/* <button use:longpress={500} on:longpress={clickHandler}>... */
export function longpress(node, threshold = 500) {
	const handle_mousedown = () => {
		let start = Date.now();
		
		const timeout = setTimeout(() => {
			node.dispatchEvent(new CustomEvent('longpress'));
		}, threshold);
		
		const cancel = () => {
			clearTimeout(timeout);
			node.removeEventListener('mousemove', cancel);
			node.removeEventListener('mouseup', cancel);
		};
		
		node.addEventListener('mousemove', cancel);
		node.addEventListener('mouseup', cancel);
	}
	
	node.addEventListener('mousedown', handle_mousedown);
	
	return {
		destroy() {
			node.removeEventListener('mousedown', handle_mousedown);
		}
	};
}