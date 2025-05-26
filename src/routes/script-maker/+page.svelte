

<script>
    import InspectRoleDrawer from "../../components/InspectRoleDrawer.svelte";
    import RoleChooserManyDrawer from "../../components/RoleChooserManyDrawer.svelte";
    import RoleListWithRoles from "../../components/RoleListWithRoles.svelte";
    import { difficultyNames, getAllRoleDifficulties, getRole, getRoles, getSectionFilters } from "../../lib/Database";

    const allRoles = getRoles()

    let chosenRoles = []
    let isRoleChooserOpen = false

    function onOpenRolesButtonClick(evt) {
        isRoleChooserOpen = true
    }
    function onRoleChosen(roleI) {
        console.log(`Chose role ${roleI}`)
        chosenRoles = [...chosenRoles, allRoles[roleI]]
    }

</script>

<RoleChooserManyDrawer
    isOpen={isRoleChooserOpen}
    roles={allRoles}
    
    sectionFilters={getSectionFilters()}
    sectionTitles={getAllRoleDifficulties().map(difficulty => difficultyNames[difficulty])}
    sectionTexts={getAllRoleDifficulties().map(difficulty => '')}

    onClickOnRole={clickedRoleI => { onRoleChosen(clickedRoleI) }}
    onClickOutside={() => { isRoleChooserOpen = false }}
></RoleChooserManyDrawer>

<div class="page">

    <h1 class="center-text margin-top-4">Script Maker</h1>

    <div class="center-content margin-top-2">
        <button class="btn blue" on:click={onOpenRolesButtonClick}>Open Roles</button>
    </div>

    <RoleListWithRoles
        roles={chosenRoles}
        hasBadges={false}
        hasRibbons={true}
        on:role-click={evt => {
            currentInspectorObject = evt.detail.role
            console.log(evt.detail.role)
        }}
    />

</div>