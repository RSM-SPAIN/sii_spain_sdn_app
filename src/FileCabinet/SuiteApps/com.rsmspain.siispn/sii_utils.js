/**
 * Utils generales del módulo SII 2.0
 * Versión: 0.0.4
 * Fecha: 02/06/2020
 */

function getSettings(ntype, subsidiary) {
    var map = {};
    var filters = [
        ['custrecord_x_siiset_subsidiaries', 'anyof', subsidiary || '1'] , 'and',
        [
            ['custrecord_x_siisettra_parent.custrecord_x_siisettra_transtype', 'anyof', ntype] , 'or',
            ['custrecord_x_siiws_parent.custrecord_x_siiws_transtype', 'anyof', ntype]
        ]
    ];
    var columns = [];
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_companynametype'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_consumerid'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_consumerkey'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_tokenid'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_tokenkey'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_includependapproval'));
    columns.push(new nlobjSearchColumn('custrecord_x_siisettra_transtype', 'custrecord_x_siisettra_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siisettra_location', 'custrecord_x_siisettra_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siisettra_autoexport', 'custrecord_x_siisettra_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siisettra_invoicetype', 'custrecord_x_siisettra_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siisettra_billtype', 'custrecord_x_siisettra_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siisettra_credittype', 'custrecord_x_siisettra_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiws_transtype', 'custrecord_x_siiws_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiws_synctype', 'custrecord_x_siiws_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiws_prdurl', 'custrecord_x_siiws_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiws_sbxurl', 'custrecord_x_siiws_parent'));
    if (!map.hasOwnProperty(ntype)) map[ntype] = {
        include_pending_approval: false,
        tokens: {consumer_id: '', consumer_key: '', token_id: '', token_key: ''},
        location: {},
        endpoints: {},
        getValues: function(loc) {
            return !!loc && !!this.location.hasOwnProperty(loc) ? this.location[loc] : this.location.default;
        }
    };

    var results = nlapiSearchRecord('customrecord_x_sii_settings', null, filters, columns);
    for (var row in results) {
        var loc = results[row].getValue('custrecord_x_siisettra_location', 'custrecord_x_siisettra_parent') || 'default';
        var sync = results[row].getValue('custrecord_x_siiws_synctype', 'custrecord_x_siiws_parent');
        var siisettra_ntype = results[row].getValue('custrecord_x_siisettra_transtype', 'custrecord_x_siisettra_parent');
        var siiws_ntype = results[row].getValue('custrecord_x_siiws_transtype', 'custrecord_x_siiws_parent');

        map[ntype].include_pending_approval = results[row].getValue('custrecord_x_siiset_includependapproval');

        if (siisettra_ntype == ntype) {
            map[ntype].tokens.consumer_id = results[row].getValue('custrecord_x_siiset_consumerid');
            map[ntype].tokens.consumer_key = results[row].getValue('custrecord_x_siiset_consumerkey');
            map[ntype].tokens.token_id = results[row].getValue('custrecord_x_siiset_tokenid');
            map[ntype].tokens.token_key = results[row].getValue('custrecord_x_siiset_tokenkey');
        };
        if (siisettra_ntype == ntype && !map[ntype].location.hasOwnProperty(loc)) map[ntype].location[loc] = {
            autoexp: results[row].getValue('custrecord_x_siisettra_autoexport', 'custrecord_x_siisettra_parent'),
            invoice_type: results[row].getValue('custrecord_x_siisettra_invoicetype', 'custrecord_x_siisettra_parent'),
            bill_type: results[row].getValue('custrecord_x_siisettra_billtype', 'custrecord_x_siisettra_parent'),
            credit_type: results[row].getValue('custrecord_x_siisettra_credittype', 'custrecord_x_siisettra_parent'),
        };
        if (siiws_ntype == ntype && !map[ntype].endpoints.hasOwnProperty(sync)) map[ntype].endpoints[sync] = {
            sbx: results[row].getValue('custrecord_x_siiws_sbxurl', 'custrecord_x_siiws_parent'),
            prd: results[row].getValue('custrecord_x_siiws_prdurl', 'custrecord_x_siiws_parent')
        };
    }

    return map[ntype];
}

function getTokens(subsidiary) {
    var map = {};
    var filters = [new nlobjSearchFilter('custrecord_x_siiset_subsidiaries', null, 'anyof', subsidiary || '1')];
    var columns = [];
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_companynametype'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_consumerid'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_consumerkey'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_tokenid'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_tokenkey'));

    var results = nlapiSearchRecord('customrecord_x_sii_settings', null, filters, columns);
    for (var row in results) {
        map.consumer_id = results[row].getValue('custrecord_x_siiset_consumerid');
        map.consumer_key = results[row].getValue('custrecord_x_siiset_consumerkey');
        map.token_id = results[row].getValue('custrecord_x_siiset_tokenid');
        map.token_key = results[row].getValue('custrecord_x_siiset_tokenkey');
        break;
    }
    return map;
}

function getAEATUrls(subsidiary, emitted) {
    var trans_ids = {true: ['7', '10', '5', '29'], false: ['17', '20', '21', '22']};
    var filters = [
        ['custrecord_x_siiset_subsidiaries', 'anyof', subsidiary || '1'] , 'and',
        ['custrecord_x_siiws_parent.custrecord_x_siiws_transtype', 'anyof', trans_ids[emitted]]
    ];

    var columns = [];
    columns.push(new nlobjSearchColumn('custrecord_x_siiset_tosandbox'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiws_prdurl', 'custrecord_x_siiws_parent'));
    columns.push(new nlobjSearchColumn('custrecord_x_siiws_sbxurl', 'custrecord_x_siiws_parent'));

    var results = nlapiSearchRecord('customrecord_x_sii_settings', null, filters, columns);
    for (var row in results) {
        return results[row].getValue('custrecord_x_siiset_tosandbox') == 'T' ?
            results[row].getValue('custrecord_x_siiws_sbxurl', 'custrecord_x_siiws_parent') :
            results[row].getValue('custrecord_x_siiws_prdurl', 'custrecord_x_siiws_parent');
    }

    return null;
}

function getSublistSubsidiaries() {
    var map = {};
    if (!!nlapiGetContext().getFeature('SUBSIDIARIES')) {
        var filters = [];
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('iselimination', null, 'is', 'F'));

        var results = nlapiSearchRecord('subsidiary', null, filters, new nlobjSearchColumn('custrecord_x_sii_certificate'));
        for (var row in results) map[results[row].getId()] = !!results[row].getValue('custrecord_x_sii_certificate');
    } else {
        map['1'] = !!nlapiLoadConfiguration('companyinformation').getFieldValue('custrecord_x_sii_certificate');
    }

    return map;
}

function useSII(subsidiaries, isClientEvent) {
    if (!!nlapiGetContext().getFeature('SUBSIDIARIES')) {
        var filters = [];
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('iselimination', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_certificate', null, 'noneof', '@NONE@'));
        filters.push(new nlobjSearchFilter('internalid', null, 'anyof', (subsidiaries || 1)));
        return !!nlapiSearchRecord('subsidiary', null, filters);
    } else {
        if (isClientEvent) {
            return nlapiGetSubsidiary();
            //Siempre devuelve la subsidiria del usuario
            //si es unisubsidiaria y tiene el bundle isntalado
            //suponemos que quiere usarlo.
        } else {
            return !!nlapiLoadConfiguration('companyinformation').getFieldValue('custrecord_x_sii_certificate');
        }
    }
}

function getTipoFactura(code, rec_type) {
    switch (rec_type) {
        case 'invoice': case 'creditmemo': case 'cashrefund': case 'cashsale':
            var table = "customrecord_x_sii_l2_emi";
            var field = "custrecord_x_l2_emi_codigo";
            break;
        case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund':
            var table = "customrecord_x_sii_l2_reci";
            var field = "custrecord_x_l2_reci_codigo";
            break;
        default: return null;
    }

    var results = nlapiSearchRecord(table, null, new nlobjSearchFilter(field, null, 'is', code));
    for (var row in results) return results[row].getId();
    return null;
}

function getClaveRegimen(code, rec_type) {
    switch (rec_type) {
        case 'invoice': case 'creditmemo': case 'cashrefund': case 'cashsale':
            var table = "customrecord_x_sii_l3_1";
            var field = "custrecord_x_l3_1_codigo";
            break;
        case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund':
            var table = "customrecord_x_sii_l3_2";
            var field = "custrecord_x_l3_2_codigo";
            break;
        default: return null;
    }

    var results = nlapiSearchRecord(table, null, new nlobjSearchFilter(field, null, 'is', code));
    for (var row in results) return results[row].getId();
    return null;
}

function getTipoRectificativa(code) {
    var results = nlapiSearchRecord('customrecord_x_sii_l5', null, new nlobjSearchFilter('custrecord_x_l5_codigo', null, 'is', code));
    for (var row in results) return results[row].getId();
    return null;
}

/**
 * Esta función cumplimenta automaticamente, en función del tipo de transacción y los datos de la configuración. SOLO para eventos de usuario (AS), Schedulers, MassUpdate o MapReduce.
 * @param {*} rectype tipo de transacción
 * @param {*} id identificador de la transacción
 */
function setDefaultValuesOnTransLoad(rectype, id) {
    var exempt = false;
    var sublists = ['item', 'expense', 'expcost', 'itemcost'], items = [];
    var emit_trans = ['invoice', 'creditmemo', 'cashsale', 'cashrefund'];
    var trantype = (emit_trans.indexOf(rectype) >= 0) ? 'tipofacturaemitida' : 'tipofacturarecibida';
    var keytype = (emit_trans.indexOf(rectype) >= 0) ? 'claveregimenexpedidas' : 'claveregimenrecibidas';
    var taxtypes = null;

    if (!id) return false;

    var record = nlapiLoadRecord(rectype, id);
    var ntype = record.getFieldValue('ntype');
    var subsidiary = record.getFieldValue('subsidiary');
    var location = record.getFieldValue('location');
    var trantype_v = record.getFieldValue('custbody_x_sii_' + trantype);
    var keytype_v = record.getFieldValue('custbody_x_sii_' + keytype);
    var credtype = record.getFieldValue('custbody_x_sii_tiporectificativa');
    var f_contab = record.getFieldValue('custbody_x_sii_fechacontab') || nlapiDateToString(new Date());
    var settings = getSettings(ntype, subsidiary);
    var values = settings.getValues(location);

    switch (rectype) {
        case 'invoice': case 'creditmemo': case 'cashrefund': case 'cashsale':
            if (!values) {
                var results = nlapiSearchRecord('customrecord_x_sii_l2_emi', null, new nlobjSearchFilter('custrecord_x_l2_emi_codigo', null, 'is', (rectype == 'invoice' || rectype == 'cashsale')  ? 'F1' : 'R1'));
                if (!!results) record.setFieldValue('custbody_x_sii_tipofacturaemitida', !trantype_v ? results[0].getId() : trantype_v);
            } else {
                record.setFieldValue('custbody_x_sii_tipofacturaemitida', !trantype_v ? values.invoice_type : trantype_v);
                if (rectype == 'creditmemo' || rectype == 'cashrefund') record.setFieldValue('custbody_x_sii_tiporectificativa', !credtype ? values.credit_type : credtype);
            }
            break;
        case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund':
            if (!values) {
                var results = nlapiSearchRecord('customrecord_x_sii_l2_reci', null, new nlobjSearchFilter('custrecord_x_l2_reci_codigo', null, 'is', rectype == 'vendorbill' || rectype == 'creditcardcharge' ? 'F1' : 'R1'));
                if (!!results) record.setFieldValue('custbody_x_sii_tipofacturarecibida', !trantype_v ? results[0].getId() : trantype_v);
            } else {
                record.setFieldValue('custbody_x_sii_tipofacturarecibida', !trantype_v ? values.bill_type : trantype_v);
                if (rectype == 'vendorcredit' || rectype == 'creditcardrefund') record.setFieldValue('custbody_x_sii_tiporectificativa', !credtype ? values.credit_type : credtype);
            }
            record.setFieldValue('custbody_x_sii_fechacontab', f_contab);
            break;
    }

    for (var i in sublists) {
        for (var line = 1; line <= record.getLineItemCount(sublists[i]); line++) {
            var item = record.getLineItemValue(sublists[i], 'taxcode', line);
            if (!!item) items.push(item);
        }
    }

    if (items.length > 0) {
        var optypes = {S1: '1', S2: '2', S3: '3'}, operations = {};
        var columns = [], keys = [];
        columns.push(new nlobjSearchColumn('exempt'));
        columns.push(new nlobjSearchColumn('custrecord_x_sii_tipooperacion'));
        columns.push(new nlobjSearchColumn('custrecord_x_sii_claveregimenexpedidas'));
        columns.push(new nlobjSearchColumn('custrecord_x_sii_claveregimenrecibidas'));
        columns.push(new nlobjSearchColumn('isexcludetaxreports'));
        columns.push(new nlobjSearchColumn('custrecord_x_sii_tax_tipopresentacion'));

        var results = nlapiSearchRecord('salestaxitem', null, new nlobjSearchFilter('internalid', null, 'anyof', items), columns);
        for (var row in results) {
            exempt = !exempt ? results[row].getValue('exempt') == 'T' : exempt;
            switch (results[row].getValue('custrecord_x_sii_tipooperacion')) {
                case optypes.S1: operations['S1'] = results[row].getValue('custrecord_x_sii_tipooperacion'); break;
                case optypes.S2: operations['S2'] = results[row].getValue('custrecord_x_sii_tipooperacion'); break;
                default: operations['null'] = results[row].getValue('custrecord_x_sii_tipooperacion'); break;
            }

            if (!taxtypes) taxtypes = results[row].getValue('custrecord_x_sii_tax_tipopresentacion');
            if (results[row].getValue('isexcludetaxreports') != 'T') {
                if (keys.indexOf(results[row].getValue('custrecord_x_sii_' + keytype) < 0))
                    keys.push(results[row].getValue('custrecord_x_sii_' + keytype));
            }
        }

        record.setFieldValue('custbody_x_sii_tipopresentacion', taxtypes || 1);
        record.setFieldValue('custbody_x_sii_' + keytype, (!keytype_v ? (keys.length == 1 && !!keys[0] ? keys[0] : getClaveRegimen('01', rectype)) : keytype_v));
        if (!exempt) record.setFieldValue('custbody_x_sii_causaexencion', '');
        if (!!operations.hasOwnProperty('S1') && !!operations.hasOwnProperty('S2')) //la condición null se excluye en este caso a partir del día 13/04/2021 a petición de fran
            record.setFieldValue('custbody_x_sii_tipooperacion', optypes.S3);
        else if (!!operations.hasOwnProperty('S1') && !operations.hasOwnProperty('S2'))
            record.setFieldValue('custbody_x_sii_tipooperacion', optypes.S1);
        else if (!!operations.hasOwnProperty('S2'))
            record.setFieldValue('custbody_x_sii_tipooperacion', optypes.S2);
        else
            record.setFieldValue('custbody_x_sii_tipooperacion', '');
    }

    nlapiSubmitRecord(record, true, true);
}

/**
 * Esta función asocia una exportación a un registro, cargándolo, vinculándolo y guardándolo. SOLO para eventos de usuario (AS), Schedulers, MassUpdate o MapReduce.
 * @param {*} rectype tipo de transacción
 * @param {*} id identificador de la transacción
 */
function setExportLoad(rectype, id) {
    var maxlin = 900;
    var emit_trans = ['invoice', 'creditmemo', 'cashsale', 'cashrefund'];
    var sendtype = {A: '1', B: '2', M: '3'};
    var billStatus = {
        correcto: '1',
        aceptado: '2',
        incorrecto: '3',
        exportado: '4'
    }

    if (!id) return false;

    var record = nlapiLoadRecord(rectype, id);
    var subsidiary = record.getFieldValue('subsidiary');
    var ntype = record.getFieldValue('ntype');
    var exclude = record.getFieldValue('custbody_x_sii_excludefromexport') == 'T';
    var emitted = (emit_trans.indexOf(rectype) >= 0) ? 'T': 'F';
    var location = record.getFieldValue('location');
    var type = record.getFieldValue('custbody_x_sii_tipopresentacion') || 1;
    var pending_approval = record.getFieldValue('approvalstatus') == '1';
    var tranid = record.getFieldValue('tranid');
    var vatregnum = record.getFieldValue('vatregnum');
    var settings = getSettings(ntype, subsidiary);
    var values = settings.getValues(location);

    if (!!exclude) {
        do {
            var find = record.findLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_estadofactura', billStatus.exportado);
            if (find > 0) record.removeLineItem('recmachcustrecord_x_le_transaccion', find);
        } while (find > 0);
    }

    if (!useSII(subsidiary) || !!exclude || !values || (!!values && (values.autoexp != 'T' || (values.include_pending_approval != 'T' && !!pending_approval)))) return false;

    var exportable = isExportable(record.getFieldValue('id'));
    if (!exportable.exportable || !!lineTaxUndef()) return false;

    var exportId = currentExport(emitted, type, subsidiary, exportable.send);
    if (!!exportId) {
        var exp = nlapiLoadRecord('customrecord_x_sii_tablaexportaciones', exportId);
        var lines = exp.getLineItemCount('recmachcustrecord_x_le_exportacion');
        if (lines > maxlin) {
            createFile(exportId);
            exportId = null;
        }
    }

    var exported = record.findLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_estadofactura', billStatus.exportado);
    if (exported <= 0) {
        if (!exportId) {
            var exp = nlapiCreateRecord('customrecord_x_sii_tablaexportaciones');
            exp.setFieldValue('custrecord_x_sii_tipoenvioaeat', exportable.send);
            exp.setFieldValue('custrecord_x_sii_subsidiary', subsidiary || 1);
            exp.setFieldValue('custrecord_x_sii_sonfacturasemitidas', emitted);
            exp.setFieldValue('custrecord_x_sii_tipopresentacion', type);
            exportId = nlapiSubmitRecord(exp, true, true);
        }

        var find = record.findLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_exportacion', exportId);
        find <= 0 ? record.selectNewLineItem('recmachcustrecord_x_le_transaccion') : record.selectLineItem('recmachcustrecord_x_le_transaccion', find);
        record.setCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_tran_number', tranid);
        record.setCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_tran_nif', vatregnum);
        record.setCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_exportacion', exportId);
        record.setCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_estadofactura', billStatus.exportado);
        record.setCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_recordtype', rectype);
        record.commitLineItem('recmachcustrecord_x_le_transaccion');
    }

    nlapiSubmitRecord(record, true, true);

    function isExportable(id) {
        var filters = [], columns = [], response = {exportable: true, send: sendtype.A};
        if (!!id) {
            filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            filters.push(new nlobjSearchFilter('custrecord_x_le_transaccion', null, 'anyof', id));
            filters.push(new nlobjSearchFilter('custrecord_x_le_exportacion', null, 'noneof', ['@NONE@']));
            filters.push(new nlobjSearchFilter('custrecord_x_le_estadofactura', null, 'noneof', ['@NONE@']));

            columns.push(new nlobjSearchColumn('created').setSort(true));
            columns.push(new nlobjSearchColumn('custrecord_x_le_estadofactura'));

            var results = nlapiSearchRecord('customrecord_x_sii_lineasexportaciones', null, filters, columns);
            for (var row in results) {
                switch (results[row].getValue('custrecord_x_le_estadofactura')) {
                    case billStatus.exportado: case billStatus.incorrecto: response.send = sendtype.A; break;
                    case billStatus.aceptado: response.send = sendtype.M; break;
                    case billStatus.correcto: response.exportable = false; break;
                }
                if (!response.exportable || response.send == sendtype.M) break;
            }
        }

        return response;
    }

    function currentExport(emitted, type, subsidiary, send) {
        var filters = [];
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_ficheroexpgenerado', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_respuestaglobal', null, 'anyof', ['@NONE@']));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_sonfacturasemitidas', null, 'is', emitted));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_tipopresentacion', null, 'anyof', type || 1));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_tipoenvioaeat', null, 'anyof', (send || sendtype.A)));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_subsidiary', null, 'anyof', subsidiary || 1));

        var results = nlapiSearchRecord('customrecord_x_sii_tablaexportaciones', null, filters, new nlobjSearchColumn('internalid').setSort(true));
        for (var row in results) return results[row].getId();
        return null;
    }

    function lineTaxUndef() {
        var codes = [];
        for (var line = 1; line <= record.getLineItemCount('item'); line++) {
            var taxcode = record.getLineItemValue('item', 'taxcode', line);
            if (!!taxcode && codes.indexOf(taxcode) < 0) codes.push(taxcode);
        }

        var filters = [];
        filters.push(new nlobjSearchFilter('internalid', null, 'anyof', codes));
        filters.push(new nlobjSearchFilter('isexcludetaxreports', null, 'is', 'T'));
        return codes.length > 0 ? !!nlapiSearchRecord('salestaxitem', null, filters) : false;
    }
}


/**
 * Esta función cumplimenta automaticamente, en función del tipo de transacción y los datos de la configuración, vinculándolo bajo evento de workflow (AS)
 * @param {*} rectype tipo de transacción
 */
function setDefaultValuesOnTransWF(rectype) {
    var exempt = false;
    var emit_trans = ['invoice', 'creditmemo', 'cashsale', 'cashrefund'];
    var sublists = ['item', 'expense', 'expcost', 'itemcost'], items = [];
    var trantype = (emit_trans.indexOf(rectype) >= 0) ? 'tipofacturaemitida' : 'tipofacturarecibida';
    var keytype = (emit_trans.indexOf(rectype) >= 0) ? 'claveregimenexpedidas' : 'claveregimenrecibidas';
    var taxtypes = null;

    var ntype = nlapiGetFieldValue('ntype');
    var subsidiary = nlapiGetFieldValue('subsidiary');
    var location = nlapiGetFieldValue('location');
    var trantype_v = nlapiGetFieldValue('custbody_x_sii_' + trantype);
    var keytype_v = nlapiGetFieldValue('custbody_x_sii_' + keytype);
    var credtype = nlapiGetFieldValue('custbody_x_sii_tiporectificativa');
    var f_contab = nlapiGetFieldValue('custbody_x_sii_fechacontab') || nlapiDateToString(new Date());
    var settings = getSettings(ntype, subsidiary);
    var values = settings.getValues(location);
    if (!useSII(subsidiary)) return true;

    switch (rectype) {
        case 'invoice': case 'creditmemo': case 'cashrefund': case 'cashsale':
            if (!values) {
                var results = nlapiSearchRecord('customrecord_x_sii_l2_emi', null, new nlobjSearchFilter('custrecord_x_l2_emi_codigo', null, 'is', (rectype == 'invoice' || rectype == 'cashsale') ? 'F1' : 'R1'));
                if (!!results) nlapiSetFieldValue('custbody_x_sii_tipofacturaemitida', !trantype_v ? results[0].getId() : trantype_v);
            } else {
                nlapiSetFieldValue('custbody_x_sii_tipofacturaemitida', !trantype_v ? values.invoice_type : trantype_v);
                if (rectype == 'creditmemo' || rectype == 'cashrefund') nlapiSetFieldValue('custbody_x_sii_tiporectificativa', !credtype ? values.credit_type : credtype);
            }
            break;
        case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund':
            if (!values) {
                var results = nlapiSearchRecord('customrecord_x_sii_l2_reci', null, new nlobjSearchFilter('custrecord_x_l2_reci_codigo', null, 'is', (rectype == 'vendorbill' || rectype == 'creditcardcharge') ? 'F1' : 'R1'));
                if (!!results) nlapiSetFieldValue('custbody_x_sii_tipofacturarecibida', !trantype_v ? results[0].getId() : trantype_v);
            } else {
                nlapiSetFieldValue('custbody_x_sii_tipofacturarecibida', !trantype_v ? values.bill_type : trantype_v);
                if (rectype == 'vendorcredit' || rectype == 'creditcardrefund') nlapiSetFieldValue('custbody_x_sii_tiporectificativa', !credtype ? values.credit_type : credtype);
            }
            nlapiSetFieldValue('custbody_x_sii_fechacontab', f_contab);
            break;
    }

    for (var i in sublists) {
        for (var line = 1; line <= nlapiGetLineItemCount(sublists[i]); line++) {
            var item = nlapiGetLineItemValue(sublists[i], 'taxcode', line);
            if (!!item) items.push(item);
        }
    }

    if (items.length > 0) {
        var optypes = {S1: '1', S2: '2', S3: '3'}, operations = {};
        var columns = [], keys = [];
        columns.push(new nlobjSearchColumn('exempt'));
        columns.push(new nlobjSearchColumn('custrecord_x_sii_tipooperacion'));
        columns.push(new nlobjSearchColumn('custrecord_x_sii_claveregimenexpedidas'));
        columns.push(new nlobjSearchColumn('custrecord_x_sii_claveregimenrecibidas'));
        columns.push(new nlobjSearchColumn('isexcludetaxreports'));
        columns.push(new nlobjSearchColumn('custrecord_x_sii_tax_tipopresentacion'));

        var results = nlapiSearchRecord('salestaxitem', null, new nlobjSearchFilter('internalid', null, 'anyof', items), columns);
        for (var row in results) {
            exempt = !exempt ? results[row].getValue('exempt') == 'T' : exempt;
            switch (results[row].getValue('custrecord_x_sii_tipooperacion')) {
                case optypes.S1: operations['S1'] = results[row].getValue('custrecord_x_sii_tipooperacion'); break;
                case optypes.S2: operations['S2'] = results[row].getValue('custrecord_x_sii_tipooperacion'); break;
                default: operations['null'] = results[row].getValue('custrecord_x_sii_tipooperacion'); break; //la condición null no se usa en ningun caso petición fran el dia 13/04/2021
            }

            if (!taxtypes) taxtypes = results[row].getValue('custrecord_x_sii_tax_tipopresentacion');
            if (results[row].getValue('isexcludetaxreports') != 'T') {
                if (keys.indexOf(results[row].getValue('custrecord_x_sii_' + keytype) < 0))
                    keys.push(results[row].getValue('custrecord_x_sii_' + keytype));
            }
        }

        nlapiSetFieldValue('custbody_x_sii_tipopresentacion', taxtypes || 1);
        nlapiSetFieldValue('custbody_x_sii_' + keytype, (!keytype_v ? (keys.length == 1 && !!keys[0] ? keys[0] : getClaveRegimen('01', rectype)) : keytype_v));
        if (!exempt) nlapiSetFieldValue('custbody_x_sii_causaexencion', '');
        if (!!operations.hasOwnProperty('S1') && !!operations.hasOwnProperty('S2')) //la condición null se excluye en este caso a partir del día 13/04/2021 a petición de fran
            nlapiSetFieldValue('custbody_x_sii_tipooperacion', optypes.S3);
        else if (!!operations.hasOwnProperty('S1') && !operations.hasOwnProperty('S2'))
            nlapiSetFieldValue('custbody_x_sii_tipooperacion', optypes.S1);
        else if (!!operations.hasOwnProperty('S2'))
            nlapiSetFieldValue('custbody_x_sii_tipooperacion', optypes.S2);
        else
            nlapiSetFieldValue('custbody_x_sii_tipooperacion', '');
    }
}

/**
 * Esta función asocia una exportación a un registro, vinculándolo bajo evento de workflow. El id del registro es OBLIGATORIO.
 * @param {*} rectype tipo de transacción
 * @param {*} id identificador de la transacción
 */
function setExportWF(rectype, id) {
    var maxlin = 900;
    var emit_trans = ['invoice', 'creditmemo', 'cashsale', 'cashrefund'];
    var sendtype = {A: '1', B: '2', M: '3'};
    var billStatus = {
        correcto: '1',
        aceptado: '2',
        incorrecto: '3',
        exportado: '4'
    }

    var subsidiary = nlapiGetFieldValue('subsidiary');
    var ntype = nlapiGetFieldValue('ntype');
    var exclude = nlapiGetFieldValue('custbody_x_sii_excludefromexport') == 'T';
    var emitted = (emit_trans.indexOf(rectype) >= 0) ? 'T': 'F';
    var location = nlapiGetFieldValue('location');
    var type = nlapiGetFieldValue('custbody_x_sii_tipopresentacion') || 1;
    var tranid = nlapiGetFieldValue('tranid');
    var vatregnum = nlapiGetFieldValue('vatregnum');
    var pending_approval = nlapiGetFieldValue('approvalstatus') == '1';
    var settings = getSettings(ntype, subsidiary);
    var values = settings.getValues(location);

    if (!!exclude) {
        do {
            var find = nlapiFindLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_estadofactura', billStatus.exportado);
            if (find > 0) nlapiRemoveLineItem('recmachcustrecord_x_le_transaccion', find);
        } while (find > 0);
    }

    if (!useSII(subsidiary) || !!exclude || !values || (!!values && (values.autoexp != 'T' || (values.include_pending_approval != 'T' && !!pending_approval)))) return false;

    var exportable = isExportable(id);
    if (!exportable.exportable || !!lineTaxUndef()) return false;

    var exportId = currentExport(emitted, type, subsidiary, exportable.send);
    if (!!exportId) {
        var exp = nlapiLoadRecord('customrecord_x_sii_tablaexportaciones', exportId);
        var lines = exp.getLineItemCount('recmachcustrecord_x_le_exportacion');
        if (lines > maxlin) {
            createFile(exportId);
            exportId = null;
        }
    }

    var exported = nlapiFindLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_estadofactura', billStatus.exportado);
    if (exported <= 0) {
        if (!exportId) {
            var exp = nlapiCreateRecord('customrecord_x_sii_tablaexportaciones');
            exp.setFieldValue('custrecord_x_sii_tipoenvioaeat', exportable.send);
            exp.setFieldValue('custrecord_x_sii_subsidiary', subsidiary || 1);
            exp.setFieldValue('custrecord_x_sii_sonfacturasemitidas', emitted);
            exp.setFieldValue('custrecord_x_sii_tipopresentacion', type);
            exportId = nlapiSubmitRecord(exp, true, true);
        }

        var find = nlapiFindLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_exportacion', exportId);
        find <= 0 ? nlapiSelectNewLineItem('recmachcustrecord_x_le_transaccion') : nlapiSelectLineItem('recmachcustrecord_x_le_transaccion', find);
        nlapiSetCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_tran_number', tranid);
        nlapiSetCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_tran_nif', vatregnum);
        nlapiSetCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_exportacion', exportId);
        nlapiSetCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_estadofactura', billStatus.exportado);
        nlapiSetCurrentLineItemValue('recmachcustrecord_x_le_transaccion', 'custrecord_x_le_recordtype', rectype);
        nlapiCommitLineItem('recmachcustrecord_x_le_transaccion');
    }

    function isExportable(id) {
        var filters = [], columns = [], response = {exportable: true, send: sendtype.A};
        if (!!id) {
            filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            filters.push(new nlobjSearchFilter('custrecord_x_le_transaccion', null, 'anyof', id));
            filters.push(new nlobjSearchFilter('custrecord_x_le_exportacion', null, 'noneof', ['@NONE@']));
            filters.push(new nlobjSearchFilter('custrecord_x_le_estadofactura', null, 'noneof', ['@NONE@']));

            columns.push(new nlobjSearchColumn('created').setSort(true));
            columns.push(new nlobjSearchColumn('custrecord_x_le_estadofactura'));

            var results = nlapiSearchRecord('customrecord_x_sii_lineasexportaciones', null, filters, columns);
            for (var row in results) {
                switch (results[row].getValue('custrecord_x_le_estadofactura')) {
                    case billStatus.exportado: case billStatus.incorrecto: response.send = sendtype.A; break;
                    case billStatus.aceptado: response.send = sendtype.M; break;
                    case billStatus.correcto: response.exportable = false; break;
                }
                if (!response.exportable || response.send == sendtype.M) break;
            }
        }

        return response;
    }

    function currentExport(emitted, type, subsidiary, send) {
        var filters = [];
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_ficheroexpgenerado', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_respuestaglobal', null, 'anyof', ['@NONE@']));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_sonfacturasemitidas', null, 'is', emitted));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_tipopresentacion', null, 'anyof', type || 1));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_tipoenvioaeat', null, 'anyof', (send || sendtype.A)));
        filters.push(new nlobjSearchFilter('custrecord_x_sii_subsidiary', null, 'anyof', subsidiary || 1));

        var results = nlapiSearchRecord('customrecord_x_sii_tablaexportaciones', null, filters, new nlobjSearchColumn('internalid').setSort(true));
        for (var row in results) return results[row].getId();
        return null;
    }

    function lineTaxUndef() {
        var codes = [];
        for (var line = 1; line <= nlapiGetLineItemCount('item'); line++) {
            var taxcode = nlapiGetLineItemValue('item', 'taxcode', line);
            if (!!taxcode && codes.indexOf(taxcode) < 0) codes.push(taxcode);
        }

        var filters = [];
        filters.push(new nlobjSearchFilter('internalid', null, 'anyof', codes));
        filters.push(new nlobjSearchFilter('isexcludetaxreports', null, 'is', 'T'));
        return codes.length > 0 ? !!nlapiSearchRecord('salestaxitem', null, filters) : false;
    }

    function createFile(id) {
        /*
        pendiente de revisar la función getSiiDocument(), no la encuentra.
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
        }*/
    }
}
