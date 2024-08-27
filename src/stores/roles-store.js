import { browser } from '$app/environment'
import { get, writable } from 'svelte/store'
import { getNightlyRolePriority, getNormalRolePriority, getRole, getRolesByDifficulty, getSetupRolePriority, setupRoles } from '../lib/Database'
import { getLocalStorageObject, localStorageWritable } from '../lib/svelteUtils'
import { getBOTCTRoles, getBOTCTRolesByPeople, getBOTCTSetupRolePriority } from '../lib/BOTCTDatabase'

export const rolesDistribution = localStorageWritable('rolesDistribution', [])

export function autochooseRoles(nPlayers) {
    const allAvailableRoles = getBOTCTRoles()
    const isRoleInGame = role => rolesInGame.find(roleInGame => roleInGame.name == role.name) != null
    let rolesInGame = getBOTCTRolesByPeople(nPlayers).map(role => ({...role, isInGame: true}))
        rolesInGame = rolesInGame.sort((a, b) => getBOTCTSetupRolePriority(a) - getBOTCTSetupRolePriority(b))
    let rolesNotInGame = allAvailableRoles.filter(role => isRoleInGame(role) == false).map(role => ({...role, isInGame: false}))
    rolesDistribution.set([...rolesInGame, ...rolesNotInGame])
}

if (browser) {
    window.patchRole = function(oldRoleName, newRoleName) {
        const newRolesDistribution = get(rolesDistribution)
        const role = newRolesDistribution.find(role => role.name == oldRoleName)
        const newRole = getRole(newRoleName)
        role.name = newRoleName
        role.effect = newRole.effect
        role.notes = newRole.notes
        role.narratorNotes = newRole.narratorNotes
        role.isValid = true
        console.log({role})
        rolesDistribution.set(newRolesDistribution)
    }
}