/**
 * Eventos de usuario para la creación de ficheros y control de campos de SII 2.0
 * Versión: 0.0.4
 * Fecha: 21/04/2021
 */

//#region MAIN EVENTS
    function siiOnBeforeLoad(type, form, request) {
        var rectype = nlapiGetRecordType();
        form.setScript('customscript_x_sii_ec');

        switch (rectype) {
            case 'customer': case 'vendor':
                if (type != 'delete') {
                    var subsidiaries = [1];
                    if (!!nlapiGetContext().getFeature('SUBSIDIARIES')) {
                        subsidiaries.push(nlapiGetFieldValue('subsidiary'));
                        for (var line = 1; line <= nlapiGetLineItemCount('submachine'); line++) subsidiaries.push(nlapiGetLineItemValue('submachine', 'subsidiary', line));
                    }

                    if (useSII(subsidiaries)) {
                        if (!nlapiGetFieldValue('custentity_x_sii_xpais') || !nlapiGetFieldValue('custentity_x_sii_tipoidentificacion')) {
                            var messages = form.addField('custpage_siiec_messages', 'textarea').setDisplayType('hidden');
                            messages.setDefaultValue('Una de las subsidiarias a las que pertenece el registro está sujeta a SII. <b>Debe</b> cumplimentar los campos en la pestaña "Impuestos España" antes de guardar.');
                        }
                    }
                }
            break;
            case 'invoice': case 'creditmemo': case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund': 
                if (type != 'delete') {
                    var sublist = form.getSubList('recmachcustrecord_x_le_transaccion');
                    if (!!sublist) sublist.setDisplayType('hidden');

                    /*Estos campos dejan de ser necesarios ya que el evento de cliente no establecerá valores por defecto en la creación o copia de facturas, cediendo la lógica
                    al workflow en evento de aftersubmit del sii_WF. En contra partida, no se verán los campos cumplimentados por defecto antes del guardado, pero se ha excluido
                    de la lógica de campos obligatorios del evento de cliente.
                    
                    form.addField('custpage_x_sii_tipofactura', 'text', 'Tipo factura (SII)').setDisplayType('hidden');
                    form.addField('custpage_x_sii_claveregimen', 'text', 'Clave régimen (SII)').setDisplayType('hidden');
                    form.addField('custpage_x_sii_tiporectificativa', 'text', 'Tipo rectificativa (SII)').setDisplayType('hidden');

                    var sl_subsidiaries = form.addSubList('custpage_x_sii_subsdata', 'list', 'Subs. data');
                    sl_subsidiaries.addField('custpage_x_sii_subsdata_usesii', 'checkbox').setDisplayType('hidden');
                    sl_subsidiaries.addField('custpage_x_sii_subsdata_id', 'select', 'Subsidiaries', 'subsidiary').setDisplayType('hidden');
                    sl_subsidiaries.setDisplayType('hidden');
                    
                    var subsidiaries = getSublistSubsidiaries();
                    var line = 1;
                    for (var row in subsidiaries) {
                        sl_subsidiaries.setLineItemValue('custpage_x_sii_subsdata_usesii', line, !!subsidiaries[row] ? 'T' : 'F');
                        sl_subsidiaries.setLineItemValue('custpage_x_sii_subsdata_id', line++, row);
                    }*/

                    if (type == 'create' || type == 'copy') {
                        resetValuesOnTrans();
                        /* Funcion excluida, consultar cabecera de método para más información
                        if (nlapiGetContext().getExecutionContext() == 'userinterface') setDefaultValuesOnLoadTrans(rectype, useSII(nlapiGetFieldValue('subsidiary')));
                        */
                    }
                }
            break;
            case 'customrecord_x_sii_tablaexportaciones':
                if (type != 'delete') {
                    var messages = form.addField('custpage_siiec_messages', 'textarea').setDisplayType('hidden');
                    form.getField('custrecord_x_sii_hash').setDisplayType('hidden');
                    form.getField('custrecord_x_sii_idficheroimportacion').setDisplayType('hidden');
                    form.getField('custrecord_x_sii_nombrefichero').setDisplayType('hidden');
                    var gen_file = form.getField('custrecord_x_sii_generarfichero');

                    if (!!nlapiGetFieldValue('custrecord_x_sii_respuestaglobal') || nlapiGetFieldValue('isinactive') == 'T') {
                        messages.setDefaultValue(!!nlapiGetFieldValue('custrecord_x_sii_respuestaglobal') ? 'La exportación ya ha sido enviada a la AEAT' : 'La exportación está inactiva' + 
                        '. Las transacciones que se deseen reenviar, se deberán incorporar en una <b>nueva</b> exportación.');
                        gen_file.setDisplayType('hidden');
                    } else if (!!nlapiGetRecordId() && nlapiGetFieldValue('isinactive') != 'T') {
                        if (type == 'view') form.addButton('custpage_btn_exportsuitelet', 'Gestionar transacciones', 'goToExportSuitelet(' + nlapiGetRecordId() + ')');
                        if (nlapiGetFieldValue('custrecord_x_sii_ficheroexpgenerado') == 'T') {
                            if (type == 'view') form.addButton('custpage_btn_makefile', 'Regenerar Fichero', 'generateFile(\'' + nlapiGetRecordId() + '\')');
                            form.addButton('custpage_btn_sendtoaeat', 'Enviar a AEAT', 'sendToAEAT(\'' + nlapiGetRecordId() + '\')');
                            messages.setDefaultValue('La exportación está lista para ser enviada a la AEAT. Cualquier modificación en la misma no se contemplará en la presentación.');
                        } else {
                            if (type == 'view') form.addButton('custpage_btn_makefile', 'Generar Fichero', 'generateFile(\'' + nlapiGetRecordId() + '\')');
                        }
                    }
                        
                    var sublist = form.getSubList('recmachcustrecord_x_le_exportacion');
                    if (!!sublist) {
                        if (sublist.getLineItemCount() > 0) {
                            form.getField('custrecord_x_sii_sonfacturasemitidas').setDisplayType('inline');
                            form.getField('custrecord_x_sii_tipopresentacion').setDisplayType('inline');
                            form.getField('custrecord_x_sii_subsidiary').setDisplayType('inline');
                            form.getField('custrecord_x_sii_tipoenvioaeat').setDisplayType('inline');
                        } 
                        sublist.setDisplayType('hidden');
                    }
                }
            break;
        }

        siiOnBeforeLoad_Custom(type, form, request);

        return true;
    }

    function siiOnBeforeSubmit(type) {
        var rectype = nlapiGetRecordType();
        var neRec = nlapiGetNewRecord(); //los cambios que ha habido en el registro se guardan aquí (no editable)
        var olRec = nlapiGetOldRecord() || nlapiCreateRecord(rectype); //los valores anteriores que hay en el registro se guardan aquí (no editable)   

        switch (rectype) {
            case 'customrecord_x_sii_tablaexportaciones':
                if (type == 'delete') {
                    var response = !neRec.getFieldValue('custrecord_x_sii_respuestaglobal') ? olRec.getFieldValue('custrecord_x_sii_respuestaglobal') : neRec.getFieldValue('custrecord_x_sii_respuestaglobal');
                    if (!!response) throw nlapiCreateError('LOCKDOWN', 'El registro ya tiene respuesta por parte de la AEAT. No se puede eliminar.');

                    var record = nlapiLoadRecord(rectype, nlapiGetRecordId(), false);
                    var lines = record.getLineItemCount('recmachcustrecord_x_le_exportacion');
                    for (var line = 1 ; line <= lines; line++)
                        record.setLineItemValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_transaccion', line, null);

                    nlapiSubmitRecord(record);
                } else if (type == 'edit' || type == 'xedit') {
                    var record = nlapiLoadRecord(rectype, nlapiGetRecordId(), false);
                    if (record.getLineItemCount('recmachcustrecord_x_le_exportacion') > 0 && !!hasChanges(neRec, olRec)) {
                        throw nlapiCreateError('LOCKDOWN', 'El registro tiene transacciones asociadas. NO se permiten modificaciones en los filtros de cabecera.');
                    }
                    if (neRec.getFieldValue('custrecord_x_sii_generarfichero') == 'T' && !!record.getFieldValue('custrecord_x_sii_respuestaglobal')) {
                        throw nlapiCreateError('LOCKDOWN', 'Esta exportación ya está presentada a la AEAT y se ha obtenido respuesta. NO se permite regenerar el fichero.');
                    }
                }
            break;
        }

        siiOnBeforeSubmit_Custom(type);

        return true;
    }

    function siiOnAfterSubmit(type) {
        var rectype = nlapiGetRecordType();
        var neRec = nlapiGetNewRecord(); //los cambios que ha habido en el registro se guardan aquí (no editable)
        var olRec = nlapiGetOldRecord() || nlapiCreateRecord(rectype); //los valores anteriores que hay en el registro se guardan aquí (no editable)

        switch (rectype) {
            case 'customrecord_x_sii_tablaexportaciones':
                if (type != 'delete') {
                    if (nlapiLookupField(rectype, nlapiGetRecordId(), 'custrecord_x_sii_generarfichero') == 'T') {
                        createFile(nlapiGetRecordId());
                    }
                }
            break;
            case 'customrecord_x_sii_lineasexportaciones':
                if (type != 'delete') {
                    if (nlapiGetContext().getExecutionContext() != 'restlet') {
                        var record_id = neRec.getFieldValue('custrecord_x_le_transaccion') || olRec.getFieldValue('custrecord_x_le_transaccion');
                        if (!!record_id) {
                            var record_type = nlapiLookupField('transaction', record_id, 'recordtype');
                            var record = nlapiLoadRecord(record_type, record_id);
                            nlapiSubmitField(rectype, nlapiGetRecordId(), ['custrecord_x_le_tran_number', 'custrecord_x_le_tran_nif', 'custrecord_x_le_recordtype', 'custrecord_x_le_tran_femi', 'custrecord_x_le_tran_contab'], 
                            [record.getFieldValue('tranid'), record.getFieldValue('vatregnum'), record_type, record.getFieldValue('custbody_x_sii_fechaemision'), record.getFieldValue('custbody_x_sii_fechacontab')]);
                        }
                    }
                }
            break;
        }

        siiOnAfterSubmit_Custom(type);

        return true;
    }
//#endregion

//#region UTILS
    function resetValuesOnTrans() {
        nlapiSetFieldValue('custbody_x_sii_tipofacturaemitida', null);
        nlapiSetFieldValue('custbody_x_sii_tipofacturarecibida', null);
        nlapiSetFieldValue('custbody_x_sii_claveregimenexpedidas', null);
        nlapiSetFieldValue('custbody_x_sii_claveregimenrecibidas', null);
        nlapiSetFieldValue('custbody_x_sii_tiporectificativa', null);
        nlapiSetFieldValue('custbody_x_sii_emitidaporterceros', null);
        nlapiSetFieldValue('custbody_x_sii_tipoopintrao', null);
        nlapiSetFieldValue('custbody_x_sii_causaexencion', null);
        nlapiSetFieldValue('custbody_x_sii_tipooperacion', null);
        nlapiSetFieldValue('custbody_x_sii_tipopresentacion', null);
        nlapiSetFieldValue('custbody_x_sii_excludefromexport', 'F');
        nlapiSetFieldValue('custbody_x_sii_fechadua', null);
        nlapiSetFieldValue('custbody_x_sii_fechaemision', null);
        nlapiSetFieldValue('custbody_x_sii_fechacontab', null);
        nlapiSetFieldValue('custbody_x_sii_dua', '');

        while (nlapiGetLineItemCount('recmachcustrecord_x_le_transaccion') > 1)
            nlapiRemoveLineItem('recmachcustrecord_x_le_transaccion', 1);
    }

    /* Función DEPRECADA ya que los valores por defecto se establecen en copia y creación mediante el workflow en AfterSubmit (sii_WF) y 
    se ha excluido las validaciones de campos obligatorios en el evento onSaveRecord del script de cliente del SII (sii_EC)

    function setDefaultValuesOnLoadTrans(recordType, isUsingSII) {
        var now = nlapiDateToString(new Date());
		switch (recordType) {
			case 'invoice':
                var tipo_factura = getTipoFactura('F1', recordType);
                var clave_reg = getClaveRegimen('01', recordType);

                if (isUsingSII){
                    nlapiSetFieldValue('custbody_x_sii_tipofacturaemitida', tipo_factura);
                    nlapiSetFieldValue('custbody_x_sii_claveregimenexpedidas', clave_reg);
                }
                nlapiSetFieldValue('custpage_x_sii_tipofactura', tipo_factura);
				nlapiSetFieldValue('custpage_x_sii_claveregimen', clave_reg);
			break;
            case 'vendorbill': case 'creditcardcharge': 
                var tipo_factura = getTipoFactura('F1', recordType);
                var clave_reg = getClaveRegimen('01', recordType);

                if (isUsingSII){
                    nlapiSetFieldValue('custbody_x_sii_tipofacturarecibida', tipo_factura);
                    nlapiSetFieldValue('custbody_x_sii_claveregimenrecibidas', clave_reg);
                    nlapiSetFieldValue('custbody_x_sii_fechacontab', now);
                }
                nlapiSetFieldValue('custpage_x_sii_tipofactura', tipo_factura);
                nlapiSetFieldValue('custpage_x_sii_claveregimen', clave_reg);
            break;
			case 'creditmemo':
                var tipo_factura = getTipoFactura('R1', recordType);
                var clave_reg = getClaveRegimen('01', recordType);
                var tipo_rec = getTipoRectificativa('I');

                if (isUsingSII){
                    nlapiSetFieldValue('custbody_x_sii_tipofacturaemitida', tipo_factura);
                    nlapiSetFieldValue('custbody_x_sii_claveregimenexpedidas', clave_reg);
                    nlapiSetFieldValue('custbody_x_sii_tiporectificativa', tipo_rec);
                }
                nlapiSetFieldValue('custpage_x_sii_tipofactura', tipo_factura);
                nlapiSetFieldValue('custpage_x_sii_claveregimen', clave_reg);
				nlapiSetFieldValue('custpage_x_sii_tiporectificativa', tipo_rec);
			break;
			case 'vendorcredit':  case 'creditcardrefund':
                var tipo_factura = getTipoFactura('R1', recordType);
                var clave_reg = getClaveRegimen('01', recordType);
                var tipo_rec = getTipoRectificativa('I');

                if (isUsingSII){
                    nlapiSetFieldValue('custbody_x_sii_tipofacturarecibida', tipo_factura);
                    nlapiSetFieldValue('custbody_x_sii_claveregimenrecibidas', clave_reg);
                    nlapiSetFieldValue('custbody_x_sii_fechacontab', now);
                    nlapiSetFieldValue('custbody_x_sii_tiporectificativa', tipo_rec);
                }
                nlapiSetFieldValue('custpage_x_sii_tipofactura', tipo_factura);
                nlapiSetFieldValue('custpage_x_sii_claveregimen', clave_reg);
				nlapiSetFieldValue('custpage_x_sii_tiporectificativa', tipo_rec);
			break;
		}
    }*/

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
                alert('Error generando fichero de exportación.\nRevise sus datos.');
            break;
        }
    }
    
    function hasChanges(neRec, olRec) {
        return (!!neRec.getFieldValue('custrecord_x_sii_sonfacturasemitidas') && neRec.getFieldValue('custrecord_x_sii_sonfacturasemitidas') != olRec.getFieldValue('custrecord_x_sii_sonfacturasemitidas')) ||
        (!!neRec.getFieldValue('custrecord_x_sii_tipopresentacion') && neRec.getFieldValue('custrecord_x_sii_tipopresentacion') != olRec.getFieldValue('custrecord_x_sii_tipopresentacion')) ||
        (!!neRec.getFieldValue('custrecord_x_sii_subsidiary') && neRec.getFieldValue('custrecord_x_sii_subsidiary') != olRec.getFieldValue('custrecord_x_sii_subsidiary')) ||
        (!!neRec.getFieldValue('custrecord_x_sii_tipoenvioaeat') && neRec.getFieldValue('custrecord_x_sii_tipoenvioaeat') != olRec.getFieldValue('custrecord_x_sii_tipoenvioaeat'));
    }
//#endregion

//#region CUSTOM FUNCTIONS
    function siiOnBeforeLoad_Custom(type, form, request) { return true; }

    function siiOnBeforeSubmit_Custom(type) { return true; }

    function siiOnAfterSubmit_Custom(type) { return true; }
//#endregion