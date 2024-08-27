import { get, writable } from 'svelte/store'
import { getLocalStorageObject, hasLocalStorageObject, localStorageWritable, setLocalStorageObject } from '../lib/svelteUtils'
import { NO_PRIORITY, getNightlyRolePriority, getSetupRolePriority } from '../lib/Database'
import { getBOTCTNightlyRolePriority, getBOTCTSetupRolePriority } from '../lib/BOTCTDatabase'

export const addedPlayers = localStorageWritable('addedPlayers', [])

export function addPlayer(extraProps) {
    let newContact = {
        subtitle: '',
        src: 'images/user.png',
        role: null,

        isPortraitCentered: true,
        isExpanded: false,
        hasSpaceUnderneath: false,
        isEditMode: true
    }
    if (extraProps != null) {
        newContact = {...newContact, ...extraProps}
    }
    addedPlayers.set([...get(addedPlayers), newContact])
}

export function setPlayerStateI(i, newState) {
    const newAddedPlayers = get(addedPlayers)
    newAddedPlayers[i] = newState
    addedPlayers.set(newAddedPlayers)
}

export function removePlayer(i) {
    const newAddedPlayers = get(addedPlayers)
    newAddedPlayers.splice(i, 1)
    addedPlayers.set(newAddedPlayers)
}

export function test_addPlayers(nPlayers) {
    addedPlayers.set([])
    for (let i = 0; i < nPlayers; i++) {
        addPlayer({ isEditMode: false, subtitle: 'Player' + i})
    }
}

export function sortCurrentRolesSetup() {
    const getRolePriority = getBOTCTSetupRolePriority
    console.log({getRolePriority})
    const addedPlayersSorted = get(addedPlayers)
        .sort((a,b) => getRolePriority(a) - getRolePriority(b))
        .map(player => ({...player, hasSpaceUnderneath: false}))
    const firstPlayerWithNoPriorityI = addedPlayersSorted.findIndex(player => getRolePriority(player.role) == NO_PRIORITY) - 1
    if (firstPlayerWithNoPriorityI >= 0) {
        addedPlayersSorted[firstPlayerWithNoPriorityI].hasSpaceUnderneath = true
    }
    addedPlayers.set(addedPlayersSorted)
}

export function sortCurrentRolesNightly() {
    const getRolePriority = getBOTCTNightlyRolePriority
    console.log({getRolePriority})
    const addedPlayersSorted = get(addedPlayers)
        .sort((a,b) => getRolePriority(a) - getRolePriority(b))
        .map(player => ({...player, hasSpaceUnderneath: false}))
    const firstPlayerWithNoPriorityI = addedPlayersSorted.findIndex(player => getRolePriority(player.role) == NO_PRIORITY) - 1
    if (firstPlayerWithNoPriorityI >= 0) {
        addedPlayersSorted[firstPlayerWithNoPriorityI].hasSpaceUnderneath = true
    }
    addedPlayers.set(addedPlayersSorted)
}

export function getResetPlayer(player) {
    return {
        ...player,
        role: null,
        src: 'images/user.png',
        hasSpaceUnderneath: false,
        statusEffects: null,
        isDead: false
    }
}