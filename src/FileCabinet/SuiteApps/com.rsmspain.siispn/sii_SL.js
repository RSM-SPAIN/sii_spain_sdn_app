/**
 * sii_SL.js
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */

// this creates a Suitelet form that lets you write and send an email
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/redirect', 'N/record', 'N/error', 'N/log','N/runtime'],
    function(n_serverwidget, n_search, n_format, n_redirect, n_record, n_error, n_log, n_runtime) {
        function onRequest(context) {
            if (context.request.method === 'GET') {
                context.response.writePage(siiForm(context));
            } else {
                siiDump(context);
            }
        }

        //#region FORMS
        function siiForm(context) {
            //Pendiente no exiete en listado real, sirve par filtrar las facturas
            //no incluidas aun en una exportación.
            var billStatus = {correcto: '1', aceptado: '2', incorrecto: '3', exportado: '4', pendiente: '0'};
            var form = n_serverwidget.createForm({title: 'SII Export', hideNavBar: false});
            form.clientScriptFileId = getFileId('sii_sl_EC.js');

            form.addTab({id: 'add', label : 'Añadir'});
            form.addTab({id: 'delete', label : 'Borrar'});
            form.addFieldGroup({id : 'filters', label : 'Filtros', tab: 'add'});

            var transtoexport_emi_type = n_runtime.isFeatureInEffect({feature: "JOBS"}) ? 'customsearch_x_sii_transtoexport_emi_job' : 'customsearch_x_sii_transtoexport_emi';
            var views = {emi: transtoexport_emi_type, rec: 'customsearch_x_sii_transtoexport_rec'};
            var status_p = context.request.parameters.status;
            var fromdate_p = context.request.parameters.fromdate;
            var todate_p = context.request.parameters.todate;
            var fromopedate_p = context.request.parameters.fromopedate;
            var toopedate_p = context.request.parameters.toopedate;
            var fromcontab_p = context.request.parameters.fromcontab;
            var tocontab_p = context.request.parameters.tocontab;
            var subsidiary_p = context.request.parameters.subsidiary;
            var type_p = context.request.parameters.type;
            var entity_p = context.request.parameters.entity;
            var tranid_p = context.request.parameters.tranid;
            var expid_p = context.request.parameters.expid;

            var exp_f = form.addField({id: 'custpage_x_export', type: n_serverwidget.FieldType.SELECT, label: 'EXPORTACIÓN', source: 'customrecord_x_sii_tablaexportaciones'});
            var trantype_f = form.addField({id: 'custpage_x_sii_sonfacturasemitidas', type: n_serverwidget.FieldType.SELECT, label: 'TIPO TRANSACCIÓN', container: 'filters'});
            var status_f = form.addField({id: 'custpage_x_status', type: n_serverwidget.FieldType.SELECT, label: 'ESTADO', container: 'filters'});
            var subsidiary_f = form.addField({id: 'custpage_x_sii_subsidiary', type: n_serverwidget.FieldType.SELECT, source: 'subsidiary', label: 'Subsidiaria', container: 'filters'});
            var fromdate_f = form.addField({id: 'custpage_x_fromdate', type: n_serverwidget.FieldType.DATE, label: 'F.TRANS. DESDE', container: 'filters'});
            var todate_f = form.addField({id: 'custpage_x_todate', type: n_serverwidget.FieldType.DATE, label: 'F.TRANS. HASTA', container: 'filters'});
            var fromopedate_f = form.addField({id: 'custpage_x_fromopedate', type: n_serverwidget.FieldType.DATE, label: 'F. OPER. DESDE', container: 'filters'});
            var toopeDate_f = form.addField({id: 'custpage_x_toopedate', type: n_serverwidget.FieldType.DATE, label: 'F. OPER. HASTA', container: 'filters'});
            var fromcontab_f = form.addField({id: 'custpage_x_fromcontabdate', type: n_serverwidget.FieldType.DATE, label: 'F.CONTA. DESDE', container: 'filters'});
            var tocontab_f = form.addField({id: 'custpage_x_tocontabdate', type: n_serverwidget.FieldType.DATE, label: 'F.CONTA. HASTA', container: 'filters'});
            var type_f = form.addField({id: 'custpage_x_sii_tipopresentacion', type: n_serverwidget.FieldType.SELECT, source: 'customlist_x_sii_tipopresentacion', label: 'TIPO PRESENTACIÓN', container: 'filters'});
            var tranid_f = form.addField({id: 'custpage_x_tranid', type: n_serverwidget.FieldType.TEXT, label: 'Transacción', container: 'filters'});
            var entity_f = form.addField({id: 'custpage_x_entity', type: n_serverwidget.FieldType.SELECT, source: '-9', label: 'Entidad', container: 'filters'});

            status_f.addSelectOption({value: '', text: ''});
            status_f.addSelectOption({value: billStatus.aceptado, text: 'Acceptado con errores'});
            status_f.addSelectOption({value: billStatus.incorrecto, text: 'Incorrecto'});

            var settings = getSettings(subsidiary_p);
            var tipoEnvioAeat = "";
            if (!!expid_p ) {
                var valuesExp = n_search.lookupFields({type: 'customrecord_x_sii_tablaexportaciones', id: expid_p, columns: ['custrecord_x_sii_tipoenvioaeat', 'custrecord_x_sii_subsidiary']});
                //Establecemos la subsidiaria de la exportación
                subsidiary_f.defaultValue = valuesExp.custrecord_x_sii_subsidiary[0].value;
                tipoEnvioAeat = valuesExp.custrecord_x_sii_tipoenvioaeat[0].value;
                //SI MODIFICACIÓN, ESTABLECE LAS CORRECTAS COMO BUSCABLES
                if (valuesExp.custrecord_x_sii_tipoenvioaeat[0].value == '3') {
                    status_f.addSelectOption({value: billStatus.correcto, text: 'Correcto'});
                } else {
                    status_f.addSelectOption({value: billStatus.pendiente, text: 'Pendiente de Exportar'});
                }
            }

            trantype_f.addSelectOption({value: '', text: ''});
            trantype_f.addSelectOption({value: 'T', text: 'Emitidas'});
            trantype_f.addSelectOption({value: 'F', text: 'Recibidas'});

            exp_f.updateDisplayType({displayType: n_serverwidget.FieldDisplayType.INLINE});
            trantype_f.updateDisplayType({displayType: n_serverwidget.FieldDisplayType.HIDDEN});

            exp_f.updateLayoutType({layoutType: n_serverwidget.FieldLayoutType.OUTSIDEBELOW});
            trantype_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.STARTROW});
            status_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.STARTROW});
            subsidiary_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.STARTROW});
            subsidiary_f.updateDisplayType({displayType: n_serverwidget.FieldDisplayType.INLINE});

            fromdate_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.STARTROW});
            fromdate_f.updateBreakType({breakType : n_serverwidget.FieldBreakType.STARTCOL});
            todate_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.MIDROW});

            fromopedate_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.STARTROW});
            toopeDate_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.MIDROW});

            fromcontab_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.STARTROW});
            fromcontab_f.updateBreakType({breakType : n_serverwidget.FieldBreakType.STARTCOL});
            tocontab_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.MIDROW});

            type_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.STARTROW});
            type_f.updateBreakType({breakType : n_serverwidget.FieldBreakType.STARTCOL});
            tranid_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.MIDROW});
            entity_f.updateLayoutType({layoutType : n_serverwidget.FieldLayoutType.STARTROW});

            exp_f.isMandatory = true;
            fromdate_f.isMandatory = true;
            todate_f.isMandatory = true;

            status_f.defaultValue = status_p;
            fromdate_f.defaultValue = fromdate_p || n_format.parse({value: new Date(), type: n_format.Type.DATE});
            todate_f.defaultValue = todate_p || n_format.parse({value: new Date(), type: n_format.Type.DATE});
            fromopedate_f.defaultValue = fromopedate_p;
            toopeDate_f.defaultValue = toopedate_p;
            fromcontab_f.defaultValue = fromcontab_p;
            tocontab_f.defaultValue = tocontab_p;
            entity_f.defaultValue = entity_p;
            tranid_f.defaultValue = tranid_p;
            exp_f.defaultValue = expid_p;
            if (!expid_p) {
                subsidiary_f.defaultValue = subsidiary_p;
                type_f.defaultValue = type_p;
            }

            //#region SUBLISTS
            if (!!expid_p) {
                var ids = [];
                var values = n_search.lookupFields({type: 'customrecord_x_sii_tablaexportaciones', id: expid_p, columns: ['custrecord_x_sii_sonfacturasemitidas']});
                trantype_f.defaultValue = !!values.custrecord_x_sii_sonfacturasemitidas ? 'T' : 'F';
                var sl_exp = form.addSublist({id: 'custpage_x_sl_exp', label: 'Añadir', type: n_serverwidget.SublistType.LIST, tab: 'add'});
                sl_exp.addMarkAllButtons();
                sl_exp.addRefreshButton();
                sl_exp.addButton({id : 'custpage_btn_applyfilters', label : 'Aplicar filtros', functionName: 'applyFilters'});
                sl_exp.addField({id: 'select', label: 'Seleccionar', type: n_serverwidget.FieldType.CHECKBOX});

                var sl_exp_del = form.addSublist({id: 'custpage_x_sl_exp_del', label: 'Borrar', type: n_serverwidget.SublistType.LIST, tab: 'delete'});
                sl_exp_del.addMarkAllButtons();
                sl_exp_del.addRefreshButton();
                sl_exp_del.addField({id: 'select', label: 'Seleccionar', type: n_serverwidget.FieldType.CHECKBOX});
                var trans_f = sl_exp_del.addField({id: 'transaction', label: 'Transacción', type: n_serverwidget.FieldType.SELECT, source: 'transaction'});
                sl_exp_del.addField({id: 'status', label: 'Estado', type: n_serverwidget.FieldType.TEXT});
                sl_exp_del.addField({id: 'errorcode', label: 'Código de error', type: n_serverwidget.FieldType.TEXT});
                sl_exp_del.addField({id: 'errordesc', label: 'Descripción de error', type: n_serverwidget.FieldType.TEXT});

                trans_f.updateDisplayType({displayType: n_serverwidget.FieldDisplayType.INLINE});

                var record = n_record.load({type: 'customrecord_x_sii_tablaexportaciones', id: expid_p, isDynamic: false});
                for (var line = 0; line < record.getLineCount('recmachcustrecord_x_le_exportacion'); line++) {
                    var transaction = record.getSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_transaccion', line);
                    var status = record.getSublistText('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_estadofactura', line);
                    var code = record.getSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_codigoerrorregistro', line)
                    var message = record.getSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_descripcionerrorregistr', line);
                    if (!!status) sl_exp_del.setSublistValue({id: 'status', line: line, value: status});
                    if (!!code) sl_exp_del.setSublistValue({id: 'errorcode', line: line, value: code});
                    if (!!message) sl_exp_del.setSublistValue({id: 'errordesc', line: line, value: message});
                    if (!!transaction) {
                        sl_exp_del.setSublistValue({id: 'transaction', line: line, value: transaction});
                        ids.push(transaction);
                    }
                }

                var search = n_search.load({id: !!values.custrecord_x_sii_sonfacturasemitidas ? views.emi : views.rec});
                search.filters.push(n_search.createFilter({name: /*!!values.custrecord_x_sii_sonfacturasemitidas ? 'trandate' : 'custbody_x_sii_fechaemision'*/ 'trandate', operator: n_search.Operator.WITHIN, values: [fromdate_f.defaultValue, todate_f.defaultValue]}));
                if (!!settings.include_pending_approval) search.filters.push(n_search.createFilter({name: 'approvalstatus', operator: 'anyof', values: ['1', '2']}));
                //Para EXP diferentes a modificación, prefiltrar las correctas y mostrar las no exportadas
                if (!!tipoEnvioAeat && tipoEnvioAeat != 3){
                    search.filters.push(n_search.createFilter({name: 'custrecord_x_le_estadofactura', join: 'CUSTRECORD_X_LE_TRANSACCION', operator: n_search.Operator.NONEOF, values:  billStatus.correcto}));
                }else{
                    search.filters.push(n_search.createFilter({name: 'custrecord_x_le_estadofactura', join: 'CUSTRECORD_X_LE_TRANSACCION', operator: n_search.Operator.NONEOF, values: '@NONE@'}));
                }

                if (!!status_p && status_p != 0){
                    if (!!status_p) search.filters.push(n_search.createFilter({name: 'custrecord_x_le_estadofactura', join: 'CUSTRECORD_X_LE_TRANSACCION', operator: n_search.Operator.ANYOF, values: status_p}));
                } else if (!!status_p && status_p == 0) {//Pendiente de Exportación
                    if (!!status_p) search.filters.push(n_search.createFilter({name: 'custrecord_x_le_estadofactura', join: 'CUSTRECORD_X_LE_TRANSACCION', operator: n_search.Operator.ANYOF, values: '@NONE@'}));
                }
                if (!!subsidiary_p){
                    if(n_runtime.isFeatureInEffect({feature: "SUBSIDIARIES"})){
                        search.filters.push(n_search.createFilter({name: 'subsidiary', operator: n_search.Operator.ANYOF, values: subsidiary_p}));
                    }
                }
                if (!!type_p) n_search.createFilter({name: 'custbody_x_sii_tipopresentacion', operator: n_search.Operator.ANYOF, values: type_p});
                if (!!entity_p) search.filters.push(n_search.createFilter({name: 'entity', operator: n_search.Operator.ANYOF, values: entity_p}));
                if (!!tranid_p) search.filters.push(n_search.createFilter({name: 'tranid', operator: n_search.Operator.CONTAINS, values: tranid_p}));
                if (!!fromcontab_p && !tocontab_p) search.filters.push(n_search.createFilter({name: 'custbody_x_sii_fechacontab', operator: n_search.Operator.ONORAFTER, values: fromcontab_p}));
                if (!fromcontab_p && !!tocontab_p) search.filters.push(n_search.createFilter({name: 'custbody_x_sii_fechacontab', operator: n_search.Operator.ONORBEFORE, values: tocontab_p}));
                if (!!fromcontab_p && !!tocontab_p) search.filters.push(n_search.createFilter({name: 'custbody_x_sii_fechacontab', operator: n_search.Operator.WITHIN, values: [fromcontab_p, tocontab_p]}));

                if (!!fromopedate_p && !toopedate_p) search.filters.push(n_search.createFilter({name: 'custbody_x_sii_fecha_operacion', operator: n_search.Operator.ONORAFTER, values: fromopedate_p}));
                if (!fromopedate_p && !!toopedate_p) search.filters.push(n_search.createFilter({name: 'custbody_x_sii_fecha_operacion', operator: n_search.Operator.ONORBEFORE, values: toopedate_p}));
                if (!!fromopedate_p && !!toopedate_p) search.filters.push(n_search.createFilter({name: 'custbody_x_sii_fecha_operacion', operator: n_search.Operator.WITHIN, values: [fromopedate_p, toopedate_p]}));

                if (!!expid_p) search.filters.push(n_search.createFilter({name: 'custrecord_x_le_exportacion', join: 'CUSTRECORD_X_LE_TRANSACCION', operator: n_search.Operator.NONEOF, values: expid_p}));
                if (!!ids && ids.length > 0) search.filters.push(n_search.createFilter({name: 'internalid', operator: n_search.Operator.NONEOF, values: ids}));

                for (var col in search.columns) {
                    sl_exp.addField({
                        id: search.columns[col].name,
                        label: search.columns[col].label || search.columns[col].name,
                        type: n_serverwidget.FieldType.TEXT
                    });
                }

                var results = search.run().getRange({start: 0, end: 1000});
                for (var row in results) {
                    for (var col in search.columns) {
                        var value = (search.columns[col].type == 'select' && !search.columns[col].summary) ? results[row].getText(search.columns[col]) : results[row].getValue(search.columns[col]);
                        if (!!value) sl_exp.setSublistValue({id: search.columns[col].name, line: Math.abs(row), value: value});
                    }
                }

                form.addSubmitButton({label: 'Ejecutar'});
            }
            //#endregion

            return form;
        }
        //#endregion

        //#region DUMPS
        function siiDump(context) {
            var request = context.request;
            var billStatus = {correcto: '1', aceptado: '2', incorrecto: '3', exportado: '4'};
            var record = n_record.load({type: 'customrecord_x_sii_tablaexportaciones', id: request.parameters.custpage_x_export, isDynamic: true});

            for (var line = 0; line < request.getLineCount('custpage_x_sl_exp'); line++) {
                if (request.getSublistValue('custpage_x_sl_exp', 'select', line) != 'T') continue;
                record.selectNewLine('recmachcustrecord_x_le_exportacion');
                record.setCurrentSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_transaccion', request.getSublistValue('custpage_x_sl_exp', 'internalid', line));
                record.setCurrentSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_tran_number', request.getSublistValue('custpage_x_sl_exp', 'tranid', line));
                record.setCurrentSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_tran_nif', request.getSublistValue('custpage_x_sl_exp', 'vatregnumber', line));
                record.setCurrentSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_estadofactura', billStatus.exportado);
                record.setCurrentSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_recordtype', request.getSublistValue('custpage_x_sl_exp', 'recordtype', line));
                record.commitLine('recmachcustrecord_x_le_exportacion');
            }

            for (var line = 0; line < request.getLineCount('custpage_x_sl_exp_del'); line++) {
                if (request.getSublistValue('custpage_x_sl_exp_del', 'select', line) != 'T') continue;
                var find = record.findSublistLineWithValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_transaccion', request.getSublistValue('custpage_x_sl_exp_del', 'transaction', line));
                if (find < 0) continue;
                record.removeLine('recmachcustrecord_x_le_exportacion', find);
            }

            var exp_status = n_search.lookupFields({type: 'customrecord_x_sii_tablaexportaciones', id: request.parameters.custpage_x_export, columns: ['custrecord_x_sii_respuestaglobal']}).custrecord_x_sii_respuestaglobal;
            if (!!exp_status && exp_status.length > 0) throw n_error.create({name: 'LOCKDOWN', message: 'La exportación ya ha sido procesada anteriormente. Respuesta establecida.', notifyOff: false}).message;

            record.setValue('custrecord_x_sii_ficheroexpgenerado', false);
            record.setValue('custrecord_x_sii_generarfichero', true);
            n_redirect.toRecord({type: 'customrecord_x_sii_tablaexportaciones', id: record.save()});
        }
        //#endregion

        //#region UTILS
        function getFileId(name) {
            var result = n_search.create({type: 'file', filters: ['name', n_search.Operator.IS, name]}).run().getRange({start: 0, end: 1});
            for (var row in result) return result[row].id;
            return null;
        }
        function getSettings(subsidiary) {
            var map = {};
            n_search.create({type: 'customrecord_x_sii_settings',
                filters: ['custrecord_x_siiset_subsidiaries', 'anyof', [subsidiary || '1']],
                columns: ['custrecord_x_siiset_includependapproval']}).run().each(
                function(result) {
                    map.include_pending_approval = result.getValue('custrecord_x_siiset_includependapproval')
                    return false;
                }
            );
            return map;
        }
        //#endregion
        return {
            onRequest: onRequest
        };
    });