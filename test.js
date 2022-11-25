// Objective:

getAppMain() // main app
    .getRootViewController() // root view controller
    .getPresentedViewController() // UTGameTabBarController (only one)
    .getCurrentViewController() // UTGameFlowNavigationController (9 available)
                                // child controllers: [UTTransfersHubViewController, UTTransferListSplitViewController]
    .getCurrentController() // UTTransferListSplitViewController
    ._listController // UTTransferListViewController
    .getIterator().next()





const temp1 = getAppMain().getRootViewController().getPresentedViewController()._childViewControllers

const transfersHub = temp1
    .filter(e => e._childViewControllers.map(c => c.constructor.name).includes("UTTransfersHubViewController"))
    .flatMap(e => e._childViewControllers.map(cv => cv._view))
    [0]


//
// MANUAL PROCESS
//

// EA App:

copy(getAppMain().getRootViewController().getPresentedViewController().getCurrentViewController().getCurrentController()._listController._viewmodel._collection.filter(e => e.type === 'player').map(e => ({name: e._staticData.name, id: e._metaData.id})))

// Futbin:

const players = players.reduce((a, v) => ({ ...a, [v.id]: v}), {}) 
const rids = Object.values(players).map(e => e.id)

[0, 25, 50, 75].forEach(i => {
    const partialRids = rids.slice(i, i+25).join(',')
    fetch(`/22/playerPrices?player=&rids=${partialRids}`).then(r => r.json()).then(json => {
        for ([id, prices] of Object.entries(json)) {
            if (id == 0) continue
            const price = prices.prices.ps.LCPrice
            players[id].price = price
        }
    })
})