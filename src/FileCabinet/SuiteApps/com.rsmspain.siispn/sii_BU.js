function siiOnBeforeInstall(toversion) {
    switch (nlapiGetContext().getCompany()) {
        case '5073216': case '5073216_SB1': break;
        case '5620435': case '5620435_SB1': break;
        case '4872598': case '4872598_SB1': break;
        case '5685344': case '5685344_SB1': break;
        case '5321529': case '5321529_SB2': break;
        case '6239794': case '6239794_SB1': break;
        case '5097113': case '5097113_SB1': break;
        case '5625026': case '5625026_SB1': break;
        case '5685338': case '5685338_SB1': break;//Softonic
        case '5431669': case '5431669_SB2': break;
        case '6130737': case '6130737_SB1': break;
        case '5779649': case '5779649_SB1': break;
        case '5675038': case '5675038_SB1': break; //Interbeverage

        default: throw nlapiCreateError('LOCKDOWN', 'Bundler unavailable. Call to RSM for further information.');
    }
}

function siiOnAfterInstall(toversion) {

}

function siiOnBeforeUpdate(fromversion, toversion) {
    switch (nlapiGetContext().getCompany()) {
        case '5073216': case '5073216_SB1': break;
        case '5620435': case '5620435_SB1': break;
        case '4872598': case '4872598_SB1': break;
        case '5685344': case '5685344_SB1': break;
        case '5321529': case '5321529_SB2': break;
        case '6239794': case '6239794_SB1': break;
        case '5097113': case '5097113_SB1': break;
        case '5625026': case '5625026_SB1': break;
        case '5685338': case '5685338_SB1': break;//Softonic
        case '5431669': case '5431669_SB2': break;
        case '6130737': case '6130737_SB1': break;
        case '5779649': case '5779649_SB1': break;
        case '5675038': case '5675038_SB1': break; //Interbeverage

        default: throw nlapiCreateError('LOCKDOWN', 'Under construction. Call to RSM for further information.');
    }
}

function siiOnAfterUpdate(fromversion, toversion) {

}

//#region FUNCIONES
function checkFeatureEnabled(pFeatureId) {
    if (!nlapiGetContext().getFeature(pFeatureId)) {
        throw new nlobjError('INSTALLATION_ERROR', 'Feature ' + pFeatureId + ' must be enabled.');
    }
}

function checkParameterEnabled(pPrefId) {
    if (!nlapiGetContext().getPreference(pPrefId)) {
        throw new nlobjError('INSTALLATION_ERROR', 'Preference ' + pPrefId + ' must be enabled.');
    }
}
//#endregion