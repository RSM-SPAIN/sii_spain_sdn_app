/**
 * Eventos de cliente del módulo SII 2.0
 * Versión: 0.0.4
 * Fecha: 21/04/2021
 */

var rsm = new rsmLib();

//#region MAIN EVENTS
    function siiOnPageInitMain() {
        var messages = document.getElementById('custpage_siiec_messages');
        if (!!messages && !!messages.value) {
            rsm.createAnnouncer('custpage_x_siiec_banner', 'Información', messages.value, 'info');
        }
    }
    window.pageinitstart = siiOnPageInitMain();

    function siiOnPageInit(type) { return siiOnPageInit_Custom(type); }

    function siiOnSaveRecord() {
      	var ret = true;
        var rectype = nlapiGetRecordType();

        switch (rectype) {
            case 'customer': case 'vendor':
                var subsidiaries = [1];
                var isClientEvent = true;
                if (!!nlapiGetContext().getFeature('SUBSIDIARIES')) {
                    subsidiaries.push(nlapiGetFieldValue('subsidiary'));
                    for (var line = 1; line <= nlapiGetLineItemCount('submachine'); line++) subsidiaries.push(nlapiGetLineItemValue('submachine', 'subsidiary', line));
                }

                if (useSII(subsidiaries, isClientEvent)) {
                    ret = !!nlapiGetFieldValue('custentity_x_sii_xpais') && !!nlapiGetFieldValue('custentity_x_sii_tipoidentificacion');
                    !ret ? rsm.createAnnouncer('custpage_x_siiec_banner', 'Atención', 'Una de las subsidiarias a las que pertenece el registro está sujeta a SII.' +
                    '<b>Debe</b> cumplimentar los campos en la pestaña "Impuestos España" antes de guardar.', 'warning') : rsm.destroyAnnouncer('custpage_x_siiec_banner');
                    rsm.netsuite.fields.setBlinkText('custpage_x_siiec_banner', true, '1', true);
                }
            break;
            case 'vendorbill': case 'vendorcredit': case 'invoice': case 'creditmemo': case 'creditcardcharge': case 'creditcardrefund': 
                ret = checkSIIRecord(rectype);
                if (!!ret) rsm.destroyAnnouncer('custpage_x_siiec_banner');
            break;
            case 'customrecord_x_sii_tablaexportaciones':
                if (nlapiGetFieldValue('custrecord_x_sii_generarfichero') == 'T') {
                    rsm.createAnnouncer('custpage_x_siiec_banner', 'Atención', 'Generando fichero, el proceso podría tardar unos minutos, por favor espere.', 'warning');
                    rsm.netsuite.fields.setBlinkText('custpage_x_siiec_banner', true, '1', true);
                }
            break;
        }

        ret = !!ret ? siiOnSaveRecord_Custom() : ret;

        return ret;
    }

    function siiOnValidateField(type, name, linenum) { return siiOnValidateField_Custom(type, name, linenum); }

    function siiOnFieldChange(type, name, linenum) { return siiOnFieldChange_Custom(type, name, linenum); }

    function siiOnPostSourcing(type, name) {
        /*
        Lógica excluida, ya que las subsidiarias únicamente pueden modificarse en evento de creación y copia y 
        estos ya se les establecerá los valores de los campos o manualmente antes de guardar la factura o mediante el workflow sii_WF.

        if (name == 'subsidiary') {
            var found_line = nlapiFindLineItemValue('custpage_x_sii_subsdata', 'custpage_x_sii_subsdata_id', nlapiGetFieldValue(name));
            if (found_line > 0) {
                if (nlapiGetLineItemValue('custpage_x_sii_subsdata', 'custpage_x_sii_subsdata_usesii', found_line) == 'T') {
                    //Invoice-CreditMemo
                    nlapiSetFieldValue('custbody_x_sii_tipofacturaemitida', nlapiGetFieldValue('custpage_x_sii_tipofactura'));
                    nlapiSetFieldValue('custbody_x_sii_claveregimenexpedidas', nlapiGetFieldValue('custpage_x_sii_claveregimen'));
                    //VendorBill-VendorCredit
                    nlapiSetFieldValue('custbody_x_sii_tipofacturarecibida', nlapiGetFieldValue('custpage_x_sii_tipofactura'));
                    nlapiSetFieldValue('custbody_x_sii_claveregimenrecibidas', nlapiGetFieldValue('custpage_x_sii_claveregimen'));
                    nlapiSetFieldValue('custbody_x_sii_fechacontab', nlapiDateToString(new Date()));
                    //Comun
                    nlapiSetFieldValue('custbody_x_sii_tiporectificativa', nlapiGetFieldValue('custpage_x_sii_tiporectificativa'));
                } else {
                    nlapiSetFieldValue('custbody_x_sii_tipofacturaemitida', null);
                    nlapiSetFieldValue('custbody_x_sii_claveregimenexpedidas', null);
                    nlapiSetFieldValue('custbody_x_sii_tipofacturarecibida', null);
                    nlapiSetFieldValue('custbody_x_sii_claveregimenrecibidas', null);
                    nlapiSetFieldValue('custbody_x_sii_tiporectificativa', null);
                    nlapiSetFieldValue('custbody_x_sii_fechacontab', null);
                }
            }
        }
        */
        return siiOnPostSourcing_Custom(type, name);
    }

    function siiOnLineInit(type) { return siiOnLineInit_Custom(type); }

    function siiOnValidateLine(type) { return siiOnValidateLine_Custom(type); }

    function siiOnRecalc(type) { return siiOnRecalc_Custom(type); }

    function siiOnValidateInsert(type) { return siiOnValidateInsert_Custom(type); }

    function siiOnValidateDelete(type) { return siiOnValidateDelete_Custom(type); }
//#endregion

//#region UTILS
    function checkSIIRecord(rectype) {
        var valid = true;
        var message = [], mandatory_fields = [];
        var isClientEvent = true;
        if (!useSII(nlapiGetFieldValue('subsidiary'), isClientEvent)) return true;
        
        switch (rectype) {
            case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund': 
                var date1 = nlapiStringToDate(nlapiGetFieldValue('custbody_x_sii_fechaemision'));
                var date2 = nlapiStringToDate(nlapiGetFieldValue('custbody_x_sii_fechacontab'));
            
                if (!!date1 && !!date2 && date1 > date2) {
                    rsm.createAnnouncer('custpage_x_sii_dates', 'Error', 'La fecha de emisión de la factura no puede ser superior a la fecha de contabilización', 'error');
                    rsm.netsuite.fields.setBlinkField('custbody_x_sii_fechaemision', true);
                    rsm.netsuite.fields.setBlinkField('custbody_x_sii_fechacontab', true);
                    valid = false;
                }
            break;
        }

        message = message.concat(checkSIIMandatoryFields(rectype, !!nlapiGetRecordId()));
        message = message.concat(checkSIILines(rectype));

        for (var i in message) {
            var field = nlapiGetField(message[i]);
            if (!!field) {
                mandatory_fields.push(field.getLabel() || field.getName());
                rsm.netsuite.fields.setBlinkField(message[i], true);
            }
        }

        if (mandatory_fields.length > 0) rsm.createAnnouncer('custpage_x_sii_mandatory_fields', 'Atención', 'Los siguientes campos son obligatorios y no están debidamente cumplimentados: ' + mandatory_fields.join(', '), 'warning');

        return !!valid && mandatory_fields.length <= 0;
    }

    function checkSIIMandatoryFields(type, onEdit) {
        var message = [], fields = [];

        switch (type) {
            case 'invoice': case 'creditmemo':
                if (!!onEdit) {
                    var fields = ['custbody_x_sii_tipofacturaemitida', 'custbody_x_sii_claveregimenexpedidas'];
                    if (type == 'creditmemo') fields.push('custbody_x_sii_tiporectificativa');
                }
            break;
            case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund':
                if (!!onEdit) {
                    var fields = ['custbody_x_sii_tipofacturarecibida', 'custbody_x_sii_claveregimenrecibidas', 'custbody_x_sii_fechaemision', 'custbody_x_sii_fechacontab'];
                    if (type == 'vendorcredit') fields.push('custbody_x_sii_tiporectificativa');
                } else {
                    var fields = ['custbody_x_sii_fechaemision'];
                }
            break;
            case 'customer': case 'vendor':
                if (!!onEdit) {
                    var fields = ['custentity_x_sii_tipoidentificacion', 'custentity_x_sii_pais'];
                }
            break;
        }

        fields.push('memo');
        for (var row in fields) {
            if (!nlapiGetFieldValue(fields[row])) message.push(fields[row]);
        }

        return message;
    }

    function checkSIILines(type) {
        var sublist = ['item', 'expense'], items = [], message = [];

        for (var i in sublist) {
            var lines = nlapiGetLineItemCount(sublist[i]);
            for (var line = 1; line <= lines; line++) {
                items.push(nlapiGetLineItemValue(sublist[i], 'taxcode', line));
            }
        }

        if (items.length > 0) {
            var columns = [];
            columns.push(new nlobjSearchColumn('exempt'));
            columns.push(new nlobjSearchColumn('custrecord_x_sii_iva_aduanas'));

            var results = nlapiSearchRecord('salestaxitem', null, new nlobjSearchFilter('internalid', null, 'anyof', items), columns);
            for (var row in results) {
                switch (type) {
                    case 'invoice': case 'creditmemo':
                        if (results[row].getValue('exempt') == 'T' && !nlapiGetFieldValue('custbody_x_sii_causaexencion')) {
                            message.push('custbody_x_sii_causaexencion'); break;
                        }
                    break;
                    case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund': 
                        if (results[row].getValue('exempt') == 'T' && !nlapiGetFieldValue('custbody_x_sii_causaexencion')) {
                            message.push('custbody_x_sii_causaexencion'); break;
                        }
                        if (results[row].getValue('custrecord_x_sii_iva_aduanas') == 'T') {
                            if (!nlapiGetFieldValue('custbody_x_sii_dua')) message.push('custbody_x_sii_dua');
                            if (!nlapiGetFieldValue('custbody_x_sii_fechadua')) message.push('custbody_x_sii_fechadua');
                            break;
                        }
                    break;
                }
            }
        }
        
        return message;
    }

    function sendToAEAT(id) {
        if (confirm('¿Está seguro que desea enviar la exportación?')) {
            var url = getUrlRest('customdeploy_x_sii_rl');
            if (!!url) {
                rsm.createAnnouncer('custpage_x_siiec_banner', 'Atención', 'Enviando exportación a la AEAT, por favor, no cierre la ventana', 'warning');
                rsm.netsuite.fields.setBlinkText('custpage_x_siiec_banner', true, '1', true);
                document.getElementById('custpage_btn_sendtoaeat').disabled = true;

                nlapiRequestURL(url, JSON.stringify({exportId: id}), {'User-Agent-x': 'SuiteScript-Call', 'Content-type': 'application/json'}, handleResponse, 'POST');
    
                function handleResponse(response) {
                    document.getElementById('custpage_btn_sendtoaeat').disabled = false;
                    response = typeof response == 'string' ? JSON.parse(response) : response;
                    if (!!response.getCode().toString().match(/^[2]/g)) {
                        rsm.createAnnouncer('custpage_x_siiec_banner', 'Confirmación', 'Proceso realizado satisfactoriamente', 'confirmation');
                        location.reload();
                    } else {
                        console.log(response);
                        if ((response.getError().message || '').indexOf('The element type "link" must be terminated by the matching end-tag') > -1) {
                            rsm.createAnnouncer('custpage_x_siiec_banner', 'Error', 'Se han detectado errores en el envío. Revise que la subsidiria tiene certificado asignado y es váido. Contacte con el administrador para más detalles', 'error');
                        } else {
                            rsm.createAnnouncer('custpage_x_siiec_banner', 'Error', 'Se han detectado errores en el envío. Contacte con el administrador para más detalles.', 'error');
                        }
                        rsm.netsuite.fields.setBlinkText('custpage_x_siiec_banner', true, '2', true);
                    }
                }
            }
        }
    }

    function generateFile(id) {
        if (confirm('¿Está seguro que desea realizar esta operación?')) {
            var url = getUrlRest('customdeploy_x_sii_rl');
            if (!!url) {
                rsm.createAnnouncer('custpage_x_siiec_banner', 'Atención', 'Generando fichero, el proceso podría tardar unos minutos, por favor espere.', 'warning');
                rsm.netsuite.fields.setBlinkText('custpage_x_siiec_banner', true, '1', true);
                document.getElementById('custpage_btn_makefile').disabled = true;

                nlapiRequestURL(url, JSON.stringify({recordtype: nlapiGetRecordType(), id: id, values: {custrecord_x_sii_generarfichero: 'T'}}), 
                {'User-Agent-x': 'SuiteScript-Call', 'Content-type': 'application/json'}, handleResponse, 'PUT');
    
                function handleResponse(response) {
                    document.getElementById('custpage_btn_makefile').disabled = false;
                    response = typeof response == 'string' ? JSON.parse(response) : response;
                    if (!!response.getCode().toString().match(/^[2]/g)) {
                        rsm.createAnnouncer('custpage_x_siiec_banner', 'Confirmación', 'Proceso realizado satisfactoriamente', 'confirmation');
                        location.reload();
                    } else {
                        console.log(response);
                        rsm.createAnnouncer('custpage_x_siiec_banner', 'Error', 'Se han detectado errores al generar el fichero. Consulte la consola para más detalles.', 'error');
                        rsm.netsuite.fields.setBlinkText('custpage_x_siiec_banner', true, '2', true);
                    }
                }
            }
        }
    }

    function getUrlRest(id) {
        var results = nlapiSearchRecord('scriptdeployment', null, new nlobjSearchFilter('scriptid', null, 'is', id));
        for (var row in results) {
            return nlapiLoadRecord('scriptdeployment', results[row].getId()).getFieldValue('url');
        }

        return null;
    }

    function goToExportSuitelet(id) {
        window.onbeforeunload = null;
        window.open(nlapiResolveURL('SUITELET', 'customscript_x_sii_slmanualexport', 'customdeploy_x_sii_slmanualexport') + '&expid=' + id, '_self');
    }
//#endregion

//#region CUSTOM FUNCTIONS
    function siiOnPageInit_Custom(type) { return true; }

    function siiOnSaveRecord_Custom() { return true; }

    function siiOnValidateField_Custom(type, name, linenum) { return true; }

    function siiOnFieldChange_Custom(type, name, linenum) { return true; }

    function siiOnPostSourcing_Custom(type, name) { return true; }

    function siiOnLineInit_Custom(type) { return true; }

    function siiOnValidateLine_Custom(type) { return true; }

    function siiOnRecalc_Custom(type) { return true; }

    function siiOnValidateInsert_Custom(type) { return true; }

    function siiOnValidateDelete_Custom(type) { return true; }
//#endregion