function autoComplete(rec_type, rec_id) {
    try {
        createFile(rec_id);
        nlapiLogExecution('AUDIT', 'EXPORT GENFILE ' + rec_id, 'OK');

        var url = getUrlRest('customdeploy_x_sii_rl');
        if (!!url) {
            var tokens = getTokens(nlapiLookupField(rec_type, rec_id, 'custrecord_x_sii_subsidiary'));
            var connection = new rsm_crypto('POST', url, tokens.consumer_id, tokens.token_id, tokens.consumer_key, tokens.token_key, nlapiGetContext().getCompany());
            var response = connection.sendRequestServer(JSON.stringify({exportId: rec_id}));

            response = typeof response == 'string' ? JSON.parse(response) : response;
            if (!response.getCode().toString().match(/^[2]/g)) {
                nlapiLogExecution('ERROR', 'EXPORT SENDTOAEAT ' + rec_id, response.getBody());
            } else {
                nlapiLogExecution('AUDIT', 'SENDTOAEAT ' + rec_id, response.getBody());
            }
        } else {
            nlapiLogExecution('ERROR', 'MISSING URL ' + rec_id);
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'GENFILE ' + rec_id, e.message);
    }
}

function autoGenFile(rec_type, rec_id) {
    try {
        createFile(rec_id);
        nlapiLogExecution('AUDIT', 'EXPORT GENFILE ' + rec_id, 'OK');
    } catch (e) {
        nlapiLogExecution('ERROR', 'GENFILE ' + rec_id, e.message);
    }
}

function autoSendToAEAT(rec_type, rec_id) {
    var url = getUrlRest('customdeploy_x_sii_rl');
    if (!!url) {
        var tokens = getTokens(nlapiLookupField(rec_type, rec_id, 'custrecord_x_sii_subsidiary'));
        var connection = new rsm_crypto('POST', url, tokens.consumer_id, tokens.token_id, tokens.consumer_key, tokens.token_key, nlapiGetContext().getCompany());
        var response = connection.sendRequestServer(JSON.stringify({exportId: rec_id}));

        response = typeof response == 'string' ? JSON.parse(response) : response;
        if (!response.getCode().toString().match(/^[2]/g)) {
            nlapiLogExecution('ERROR', 'EXPORT SENDTOAEAT ' + rec_id, response.getBody());
        } else {
            nlapiLogExecution('AUDIT', 'SENDTOAEAT ' + rec_id, response.getBody());
        }
    } else {
        nlapiLogExecution('ERROR', 'MISSING URL ' + rec_id);
    }
}

function createFile(id) {
    var filters = [], columns = [];

    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    filters.push(new nlobjSearchFilter('internalid', null, 'anyof', id));

    columns.push(new nlobjSearchColumn('name'));
    columns.push(new nlobjSearchColumn('legalname', 'custrecord_x_sii_subsidiary'));
    columns.push(new nlobjSearchColumn('taxidnum', 'custrecord_x_sii_subsidiary'));
    columns.push(new nlobjSearchColumn('name', 'custrecord_x_sii_subsidiary'));
    columns.push(new nlobjSearchColumn('custrecord_x_sii_tipoenvioaeat'));
    columns.push(new nlobjSearchColumn('custrecord_x_sii_sonfacturasemitidas'));
    columns.push(new nlobjSearchColumn('custrecord_x_sii_tp_envelope', 'custrecord_x_sii_tipopresentacion'));

    var results = nlapiSearchRecord('customrecord_x_sii_tablaexportaciones', null, filters, columns);
    for (var row in results) {
        if (!getSiiDocument(results[row], results[row].getValue('custrecord_x_sii_sonfacturasemitidas') == 'T', results[row].getValue('custrecord_x_sii_tp_envelope', 'custrecord_x_sii_tipopresentacion')))
            throw nlapiCreateError('LOCKDOWN', 'Error generando fichero de exportación.\nRevise sus datos.');
        break;
    }
}

function getUrlRest(id) {
    var results = nlapiSearchRecord('scriptdeployment', null, new nlobjSearchFilter('scriptid', null, 'is', id));
    for (var row in results) {
        return nlapiLoadRecord('scriptdeployment', results[row].getId()).getFieldValue('externalurl');
    }
    return null;
}