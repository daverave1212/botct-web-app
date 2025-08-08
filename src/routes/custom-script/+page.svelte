

<script>
    import InspectRoleDrawer from "../../components/InspectRoleDrawer.svelte";
    import RoleChooserManyDrawer from "../../components/RoleChooserManyDrawer.svelte";
    import RoleListWithRoles from "../../components/RoleListWithRoles.svelte";
    import { browser } from '$app/environment'
    import { difficultyNames, getAllRoleDifficulties, getRole, getRoles, getSectionFilters, MORNING_COLOR, NIGHTLY, NIGHTLY_COLOR, sortRolesNormal } from "../../lib/Database";
    import { encodeScriptNameAndRoleIs, getFullUrl, getScriptFromURLSvelte, getUrlWithParams, showQR, stringToBase64QRCode } from "../../lib/svelteUtils";
    import { customScripts, setCustomScript } from "../../stores/custom-scripts-store"
    import { page } from '$app/stores';

    const allRoles = getRoles()

    let openScriptName = null
    let qrCodeWrapperDiv
    let currentInspectorObject = null
    let chosenRoles = []
    let isRoleChooserOpen = false
    
    $:roleIs = chosenRoles.map(role => role.i)
    $:scriptMakerHref = getUrlWithParams('/script-maker', roleIs.length == 0? {}: {
        'custom-roles': roleIs
    })

    $: {
        const customScript = getScriptFromURLSvelte($page.url)
        const { customRoleNames, scriptName } = customScript
        if (customRoleNames != null) {
            chosenRoles = customRoleNames.map(name => getRole(name))
            openScriptName = scriptName
        }
    }

    function onRoleChosen(roleI) {
        console.log(`Chose role ${roleI}`)
        chosenRoles = [...chosenRoles, allRoles[roleI]]
    }
    async function saveAndGetQR() {
        const queryParamsObj = {
            'script-name': openScriptName,
            'custom-roles': roleIs
        }
        const completeUrl = getUrlWithParams('/custom-script', queryParamsObj)
        await showQR(qrCodeWrapperDiv, completeUrl)
    }

    async function saveAndGetQRV2() {

        const scriptName = prompt('Enter script name').trim()
        const roleIs = chosenRoles.map(role => role.i)
        const qrData = encodeScriptNameAndRoleIs(scriptName, roleIs)
        const completeUrl = getFullUrl(`/custom-script#${qrData}`)

        async function saveScript() {
            if (scriptName == null || scriptName.trim().length == 0) {
                alert('Cannot have an empty name for a script')
                return
            }
            setCustomScript(scriptName, roleIs)
        }
        saveScript()
        await showQR(qrCodeWrapperDiv, completeUrl)
    }

</script>

<InspectRoleDrawer isOpen={currentInspectorObject != null} role={currentInspectorObject} setIsOpen={() => currentInspectorObject = null}>
</InspectRoleDrawer>

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

    <h1 class="center-text margin-top-4">My Scripts</h1>

    <div class="flex wrap margin-top-2 gap-half">
        {#each Object.keys($customScripts) as customScriptName}
            <button class="btn colorful margin-top-1" on:click={() => {
                const scriptRoles = $customScripts[customScriptName]
                chosenRoles = scriptRoles.map(name => getRole(name))
                openScriptName = customScriptName
            }}>{customScriptName}</button>
        {/each}
    </div>

    {#if openScriptName != null}
        <h2 class="center-text margin-top-4">{openScriptName}</h2>
        <RoleListWithRoles
            roles={sortRolesNormal(chosenRoles)}
            hasBadges={false}
            hasRibbons={true}
            on:role-click={evt => {
                currentInspectorObject = evt.detail.role
                console.log(evt.detail.role)
            }}
        />
    {/if}

    <div class="center-content flex-column gap-1 margin-top-4">
        <button class="btn" style={`background-color: ${NIGHTLY_COLOR}`} on:click={saveAndGetQR} disabled='{!chosenRoles.length > 0}'>Show QR</button>
        <button class="btn" style={`background-color: ${NIGHTLY_COLOR}`} on:click={saveAndGetQRV2} disabled='{!chosenRoles.length > 0}'>Show QR V2</button>
        <a in:fly={{y: 100, delay: 150 }} class="btn colorful margin-top-1" href={scriptMakerHref}>Open In Script Maker</a>
        <div key="script-maker-qr-wrapper" bind:this={qrCodeWrapperDiv}></div>
    </div>

</div>