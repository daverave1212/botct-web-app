
<style>
    body {
        overflow: hidden;
    }
</style>

<script>
	import { selectedRoles } from './../../stores/selected-roles-store.js';
	import { getBOTCTRole } from './../../lib/BOTCTDatabase.js';
	import { rolesDistribution } from './../../stores/roles-store.js';
	import InspectRoleDrawer from './../../components/InspectRoleDrawer.svelte';

    import AddContactButton from "../../components/AddContactButton.svelte";
    import Contact from "../../components/Contact/Contact.svelte";
    import ContactList from "../../components/ContactList.svelte";
    import ContactListHeader from "../../components/ContactListHeader.svelte";
    import { Scaffold, SidenavItem, SidenavButton } from "saraui"
    import SideMenu from "../../components-standalone/SideMenu.svelte";
    import DrawerPage from "../../components-standalone/DrawerPage.svelte";
    import RoleChooserDrawer from "../../components/RoleChooserDrawer.svelte";
    import { ADVANCED, BAD_MOON_RISING, COMPLETE, difficultyNames, getAllRoleDifficulties, getRole, getRoles, getRolesByDifficulty, getSectionFilters, INTERMEDIATE, isRoleNameOutsider, NIGHTLY, SETUP, SPECIAL_NIGHTLY, SPECIAL_SETUP } from "../../lib/Database";
    import Modal from "../../components-standalone/Modal.svelte";
    import Tooltip from "../../components-standalone/Tooltip.svelte";
    import { addedPlayers, addPlayer, addPlayerAdded, addPlayerTemporary, getAddedPlayerRoleDifficulties, removePlaceholderRoles, removePlayer, setPlayerStateI } from "../../stores/added-players-store";
    import { sortCurrentRolesNightly, sortCurrentRolesSetup } from "../../stores/added-players-store";
    import { hasExpandTooltip, hasInspectTooltip, hasSetRoleTooltip, hasSortTooltip } from '../../stores/tutorial-store';
    import { currentlySelectedMod } from '../../stores/mods-store.js';
    import { isSecretBOTCT } from '../../stores/secret-botct-store.js';
    import RoleChooserManyDrawer from '../../components/RoleChooserManyDrawer.svelte';

    import '../../components/add-contact-button.css'
    import LocationPicker from '../../components/LocationPicker.svelte';
    import { chosenScriptRoleNames } from '../../stores/scripts-store.js';
    import { randomizeArray, removeDuplicates } from '../../lib/utils.js';
    import RoleCard from '../../components/RoleCard.svelte';
    
    $:availableRoles = $chosenScriptRoleNames == null? []: $chosenScriptRoleNames

    $: shouldShowRoleTooltip = 
        $hasSetRoleTooltip == false &&
        currentModalObject == null &&
        $hasInspectTooltip &&
        $addedPlayers.length > 0 && $addedPlayers[0].role != null
    $: shouldShowExpandTooltip =
        $hasInspectTooltip == false &&
        $hasExpandTooltip &&
        didOpenAndCloseModalOnce
    $: shouldShowSortTooltip =
        $hasExpandTooltip == false &&
        $addedPlayers.filter(player => player.role == null).length == 0 &&
        $hasSortTooltip
    
    $: areSortButtonsDisabled = $addedPlayers.filter(p => p.role == null).length > 0

    // const statusEffects = [
    //     'Protected',
    //     'Drunk',
    //     'Granny',
    //     'Poisoned',
    //     'Used Ability',
    //     'Red Herring',
    //     'Evil',
    //     'Pukkaed',
    //     'Enemy',
    //     'Targeted',
    //     'Out of Game',
    // ]

    const standardStatusEffects = [
        'Used Ability',
        'Out of Game',
        'Targeted',
    ]

    $: statusEffects = removeDuplicates([
        ...(availableRoles ?? [])
            .map(name => getRole(name))
            .filter(role => role.statusEffect != null)
            .map(role => role.statusEffect),
        ...standardStatusEffects
    ])

    // window.getRole = getRole
    // window.getAvailableRoles = () => availableRoles


    // Inspect drawer
    let didOpenAndCloseModalOnce = false
    let currentModalObject = null
    function openModalWithRoleName(roleName) {
        $hasInspectTooltip = false
        console.log(`Opening modal with ${roleName}`)
        if ($isSecretBOTCT) {
            currentModalObject = getBOTCTRole(roleName)
        } else {
            currentModalObject = getRole(roleName)
        }
    }
    function onModPortraitClick() {
        currentModalObject = $currentlySelectedMod
    }
    function closeModal() {
        currentModalObject = null
    }

    // Bluff drawer
    let isBluffDrawerOpen = false
    let bluffsBeingShown = []

    // Color drawer
    let currentColor = null

    // Role chooser
    let isRoleChooserOpen = false
    let currentlySelectedRoleI

    // Confirm modal
    let isModalOpen = false
    let modalText = ""
    let modalConfirmButtonText = "Kill!"
    let modalOnConfirm = () => {}
    let modalOnCancel = () => {}


    // Functions
    function changeNotesForPlayerI(i) {
        const playerState = $addedPlayers[i]
        const prevNote = playerState.note ?? ''
        const promptResult = prompt(`Change ${playerState.name}'s note:`, prevNote)
        const newPlayerState = {...playerState, note: promptResult}
        $addedPlayers[i] = newPlayerState
        $addedPlayers = $addedPlayers
    }
    function openRoleChangeMenuForPlayerI(i) {
        console.log('Hiding tooltip')
        $hasSetRoleTooltip = false
        currentlySelectedRoleI = i
        isRoleChooserOpen = true
        console.log($hasSetRoleTooltip)
    }
    function changeRole(playerI, newRoleI) {
        console.log(`Player ${playerI} clicked on role ${newRoleI}`)
        const newRoleName = availableRoles[newRoleI]
        const newRole = getRole(newRoleName)
        isRoleChooserOpen = false
        console.log({newRole, state: $addedPlayers[playerI] })
        const playerState = $addedPlayers[playerI]
        const previousRole = playerState.role
        const newPlayerState = {
            ...playerState,
            name: newRole.name,
            src: newRole.src == null? `images/roles/${newRole.name}.png`: newRole.src,
            role: newRole.name
        }
        $addedPlayers[playerI] = newPlayerState
        $addedPlayers = $addedPlayers
    }


    function togglePlayerDead(i) {
        const player = $addedPlayers[i]
        player.isDead = !player.isDead
        setPlayerStateI(i, player)
    }

    function onClickOnStatusEffect(playerI, statusName) {
        console.log('Adding status ' + statusName)
        const player = $addedPlayers[playerI]
        if (player.statusEffects == null) {
            player.statusEffects = []
        }

        const hasThisStatus = player.statusEffects.find(status => status == statusName) != null
        if (hasThisStatus) {
            player.statusEffects = player.statusEffects.filter(status => status != statusName)
        } else {
            player.statusEffects.push(statusName)
        }

        setPlayerStateI(playerI, player)
    }

    function closeRoleChooserDrawerWithoutSideEffects() {
        currentlySelectedRoleI = null
        isRoleChooserOpen = false
    }

    function addMissingRequiredRoles(filterExtraRequiredRolesFunc) {
        removePlaceholderRoles()
        const isAnyPlayerThisRoleName = roleName => $addedPlayers.find(player => player.role == roleName) != null

        const difficultiesInGame = getAddedPlayerRoleDifficulties()
        const allPossibleRoles = getRoles().filter(role => difficultiesInGame.includes(role.difficulty))

        const selectedRolesNotSet = allPossibleRoles.filter(role => isAnyPlayerThisRoleName(role.name) == false)
        const extraRequiredRoles = selectedRolesNotSet.filter(filterExtraRequiredRolesFunc)
        for (const role of extraRequiredRoles) {
            addPlayerTemporary(role.name)
        }
    }

    function onClickOnSortNight() {
        // const filterExtraRequiredRolesFunc = role => role => role.category == NIGHTLY || role.category == SPECIAL_NIGHTLY
        // addMissingRequiredRoles(filterExtraRequiredRolesFunc)
        sortCurrentRolesNightly()
    }
    function onClickOnSortSetup() {
        $hasSortTooltip = false
        // const filterExtraRequiredRolesFunc = role => role => role.category == SETUP || role.category == SPECIAL_SETUP
        // addMissingRequiredRoles(filterExtraRequiredRolesFunc)
        sortCurrentRolesSetup()
    }
    function onClickOnCleanup() {
        removePlaceholderRoles()
    }
    function onClickOnAdd() {
        const name = prompt('Player name')
        const player = addPlayerAdded({}, name)
    }
    function onRemovePlayer(i) {
        const player = $addedPlayers[i]
        removePlayer(i)
    }

    function openModal(text, buttonText, callback) {
        isModalOpen = true
        modalText = text
        modalConfirmButtonText = buttonText
        modalOnConfirm = callback
    }

    function showBluffs() {
        const roleNamesInGame = $addedPlayers.map(p => p?.role)
        console.log({roleNamesInGame})
        const roleNamesNotInGame = $chosenScriptRoleNames.filter(rn => !roleNamesInGame.includes(rn))
        console.log({roleNamesNotInGame})
        const goodRolesNotInGame = roleNamesNotInGame
            .map(rn => getRole(rn))
            .filter(r => r != null)
            .filter(r =>
                r.isDemon != true &&
                r.isBluffable != false &&
                r.ribbonText != 'EVIL'
            )
        console.log({goodRolesNotInGame})
        const shuffledRolesNotInGame = randomizeArray(goodRolesNotInGame)
        const top3 = shuffledRolesNotInGame.slice(0, 3)
        bluffsBeingShown = top3
        isBluffDrawerOpen = true
    }

</script>

<Modal isOpen={isModalOpen} setIsOpen={bool => isModalOpen = bool}>
    <div class="center-content padding-2">
        <p class="center-text">{modalText}<br/>Proceed to kill this person?</p>
        <div class="flex-row margin-top-1 gap-1">
            <button class="btn red" on:click={evt => {
                modalOnConfirm(true)
                isModalOpen = false
            }}>{modalConfirmButtonText}</button>
            <button class="btn gray" on:click={() => modalOnConfirm(false)}>Cancel</button>
        </div>
    </div>
</Modal>

<DrawerPage
    isOpen={isBluffDrawerOpen}
    zIndex="486 !important"
    on:click={() => isBluffDrawerOpen = false}
>
    <div class="center-content gap-1 flex-column">
        {#each bluffsBeingShown as role (role.name)}
            <RoleCard role={{...role, isBig: true}}/>
        {/each}
    </div>
</DrawerPage>

<InspectRoleDrawer
    role={currentModalObject}
    isOpen={currentModalObject != null}
    setIsOpen={bool => {
        didOpenAndCloseModalOnce = true
        closeModal()
    }}
/>

<RoleChooserManyDrawer
    isOpen={isRoleChooserOpen}
    roles={availableRoles.map(name => getRole(name))}
    
    sectionFilters={[_ => true]}
    sectionTitles={['Roles']}
    sectionTexts={['']}

    onClickOnRole={clickedRoleI => changeRole(currentlySelectedRoleI, clickedRoleI)}
    onClickOutside={() => closeRoleChooserDrawerWithoutSideEffects()}
></RoleChooserManyDrawer>

<div class="contact-list-header shadowed">
    <button class="btn" style="background-color: #AA88BB; position: relative;" on:click={onClickOnCleanup}>
        Cleanup
    </button>
    <button class="btn" style="background-color: #BB8844; position: relative;" on:click={onClickOnSortSetup}>
        <Tooltip isShown={shouldShowSortTooltip} top="3rem" left="calc(50% - 0.5rem)" width="40vw">Sort players for Setup for Night.</Tooltip>
        Sort for Setup
    </button>
    <button class="btn" style="background-color: #44AACC" on:click={onClickOnSortNight}>Sort for Night</button>
</div>

<div class="page" style="position: relative;">
    <Tooltip isShown={$hasSetRoleTooltip} top="calc(var(--contact-header-height) * 1.5)" left="50%" width="70vw">Set each player's role to the card they drew.</Tooltip>
    <Tooltip isShown={shouldShowRoleTooltip} top="calc(var(--contact-header-height) * 1.5)" left="calc(7.5vw + 0.75rem + var(--contact-header-height) / 2)" width="70vw" isLefty={true}>Click on the image to see role details.</Tooltip>
    <Tooltip isShown={shouldShowExpandTooltip} top="calc(var(--contact-header-height) * 1.5)" left="50%" width="70vw">Click to show more options (click again to hide).</Tooltip>

    <ContactList className="margin-top-1">

        {#each $addedPlayers.keys() as i (`${$addedPlayers[i].name}${i}`)}

            <Contact
                state={$addedPlayers[i]} setState={(newState) => setPlayerStateI(i, newState)}
                on:change-role={() => openRoleChangeMenuForPlayerI(i)}
                on:show-portrait={() => openModalWithRoleName($addedPlayers[i].role)}
                on:expand={() => $hasExpandTooltip = false}
            >
                <div class="">
                    <div class="flex-content wrap margin-top-1">
                        <button class="btn orange" on:click={() => changeNotesForPlayerI(i)}>Set Note</button>
                        <button class="btn blue" on:click={() => openRoleChangeMenuForPlayerI(i)}>Change Role</button>
                        <button class="btn red" on:click={() => {
                            const role = getRole($addedPlayers[i]?.role)
                            const deathReminder = role?.deathReminder
                            const isPlayerAlive = !$addedPlayers[i].isDead
                            const isLover = $addedPlayers[i].statusEffects?.includes('Granny')
                            const isProtected = $addedPlayers[i].statusEffects?.includes('Protected')

                            function maybeShowProtectedModal(callback) {
                                if (isPlayerAlive && isProtected) {
                                    openModal("This person is protected. Check if the protection should still apply.", "Kill!", (didKill) => {
                                        setTimeout(() => {
                                            callback(didKill)
                                        }, 100)
                                    })
                                } else {
                                    callback(true)
                                }
                            }

                            function maybeShowLoverModal(callback) {
                                if (isPlayerAlive && isLover) {
                                    openModal("If the Grandmother is still alive, you should kill the Grandmother too afterwards.", "Kill!", (didKill) => {
                                        setTimeout(() => {
                                            callback(didKill)
                                        }, 100)
                                    })
                                } else {
                                    callback(true)
                                }
                            }

                            function maybeShowDeathReminderModal(callback) {
                                if (isPlayerAlive && deathReminder != null) {
                                    openModal(deathReminder, "Kill!", (didKill) => {
                                        setTimeout(() => {
                                            callback(didKill)
                                        }, 100)
                                    })
                                } else {
                                    callback(true)
                                }
                            }

                            maybeShowProtectedModal(willContinue0 => {
                                if (!willContinue0) {
                                    return false
                                }
                                maybeShowLoverModal(willContinue1 => {
                                    if (!willContinue1) {
                                        return false
                                    }
                                    maybeShowDeathReminderModal(willContinue2 => {
                                        if (!willContinue2) {
                                            return false
                                        }
                                        togglePlayerDead(i)
                                    })
                                })
                            })

                        }}><img class="icon" src="/images/status/Dead.png"/> {$addedPlayers[i]?.isDead? 'Revive': 'Kill'}</button>
                    </div>
                    <div class="flex-content wrap margin-top-1">
                        {#each statusEffects as statusEffect}
                            <button class="btn" style="color: black;" on:click={()=>onClickOnStatusEffect(i, statusEffect)}> <img class="icon" src="/images/status/{statusEffect}.png"/> {statusEffect} </button>
                        {/each}
                    </div>
                    <div class="flex-content wrap margin-top-1">
                        <button class="btn gray" on:click={() => onRemovePlayer(i)}>Remove</button>
                    </div>
                </div>
            </Contact>



        {/each}

        <button class="add-contact-button shadowed rounded" on:click={onClickOnAdd} style="position: relative;">
            <div class="center-content flex-column center-text" style="width: 100%; height: 100%; line-height: 100%; font-size: 100%;">
                +
            </div>
        </button>
        <button class="add-contact-button colorful shadowed rounded" on:click={showBluffs} style="position: relative; color: white;">
            <div class="center-content flex-column center-text" style="width: 100%; height: 100%; line-height: 100%; font-size: 100%;">
                Show Bluffs
            </div>
        </button>

        <h3 class="center-text margin-top-1">To restart the game, open the menu and hit Play. All players are saved.</h3>
    
    </ContactList>   
</div>