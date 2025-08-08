
<style>

</style>

<script>
    import InspectRoleDrawer from "../../components/InspectRoleDrawer.svelte";
    import RoleCard from "../../components/RoleCard.svelte";
    import RoleList from "../../components/RoleList.svelte";
    import RoleListWithRoles from "../../components/RoleListWithRoles.svelte";
    import { ADVANCED, BAD_MOON_RISING, COMPLETE, difficultyDescriptions, difficultyNames, EVIL, evilsByPlayers, getAllRoleDifficulties, getNormalRolePriority, getRoleNumbersByPlayers, getRoles, getRolesByDifficulty, getRolesForDifficulty, getSortRolesWithPriorityFunction, INTERMEDIATE, NEGATIVE, STRIGOY, WEREWOLVES } from "../../lib/Database";
    import { getMods } from "../../lib/ModsDatabase";
    import { selectedRoles } from '../../stores/selected-roles-store'
    import { goto } from '$app/navigation'
    import { addedPlayers } from "../../stores/added-players-store";

    let currentInspectorObject = null
    let filterValue = ''
    let allAvailableRoles = getSortRolesWithPriorityFunction(getRoles(), getNormalRolePriority)

    $: rolesSetup = evilsByPlayers[$addedPlayers.length][0]
    $: nEvils = rolesSetup.filter(roleType => roleType == STRIGOY).length
    $: nNegatives = rolesSetup.filter(roleType => roleType == NEGATIVE).length
    $: nMinPeasants = Math.floor($addedPlayers.length / 6) + 1
    $: nMaxPeasants = Math.floor($addedPlayers.length / 3) + 1

    $: [ nTownsfolk, nOutsiders, nMinions, nDemons ] = getRoleNumbersByPlayers($addedPlayers.length)

    selectedRoles.subscribe(newSelectedRoles => {
        allAvailableRoles = allAvailableRoles.map(role => ({...role, isValid: !isRoleSelected(newSelectedRoles, role)}))
        console.log({allAvailableRoles})
    })

    function isRoleSelected(allRolesToCheck, obj) {
        return allRolesToCheck.find(role => role.name == obj.name) != null
    }

    function onSelectRole(obj) {
        if (!isRoleSelected($selectedRoles, obj)) {
            const isPeasantOrStrigoy = obj.name == 'Strigoy' || obj.name == 'Peasant'
            if (isPeasantOrStrigoy) {
                alert('This role is automatically in the game.')
            } else {
                $selectedRoles = [...$selectedRoles, obj]
            }
        } else {
            currentInspectorObject = {...obj}
        }
    }

    function onClickOnCurrentRole(obj) {
        $selectedRoles = $selectedRoles.filter(role => role.name != obj.name)
    }


</script>

<InspectRoleDrawer isOpen={currentInspectorObject != null} role={currentInspectorObject} setIsOpen={() => currentInspectorObject = null}/>

<div class="page">

    <h2 class="center-text margin-top-4">Roles Setup</h2>
    <p class="center-text margin-top-2">
        To setup a game with <b>{$addedPlayers.length}</b> players:
    </p>
    <p class="center-text margin-top-1" style="color: blue;"><b>Townsfolk: {nTownsfolk}</b></p>
    <p class="center-text margin-top-1" style="color: purple;"><b>Outsiders: {nOutsiders}</b></p>
    <p class="center-text margin-top-1" style="color: red;"><b>Minions: {nMinions}</b></p>
    <p class="center-text margin-top-1" style="color: red;"><b>Demon: {nDemons}</b></p>

    <div class="flex-content center-content margin-top-2">
        <a class="btn big colorful" style="width: 40vw" href="/players" on:click|preventDefault={() => goto('/players')}>Next</a>
    </div>

    <h2 class="center-text margin-top-4">All Roles (By Sets)</h2>

    <input class="search-input" bind:value={filterValue} placeholder="Filter..."/>
    {#each getAllRoleDifficulties() as difficulty, i (difficulty)}
        <h3 class="center-text margin-top-2">{difficultyNames[difficulty]}</h3>
        <p class="center-text margin-top-1">{difficultyDescriptions[difficulty]}</p>
        <RoleListWithRoles filter={filterValue} roles={getRoles().filter(role => role.difficulty == difficulty)} on:role-click={evt => currentInspectorObject = evt.detail.role}/>
    {/each}


</div>