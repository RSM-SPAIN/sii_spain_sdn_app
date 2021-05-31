define(['N/ui/dialog', 'N/currentRecord', 'N/url', 'N/format'],
    function(n_uidialog, n_curr, n_url, n_format) {
        //#region UTILS
        function applyFilters() {
            var record = n_curr.get();
            var url = '';

            if (!!record.getValue('custpage_x_status')) url += '&status=' + record.getValue('custpage_x_status');
            if (!!record.getValue('custpage_x_fromdate')) url += '&fromdate=' + n_format.format({value: record.getValue('custpage_x_fromdate'), type: n_format.Type.DATE});
            if (!!record.getValue('custpage_x_todate')) url += '&todate=' + n_format.format({value: record.getValue('custpage_x_todate'), type: n_format.Type.DATE});
            if (!!record.getValue('custpage_x_fromopedate')) url += '&fromopedate=' + n_format.format({value: record.getValue('custpage_x_fromopedate'), type: n_format.Type.DATE});
            if (!!record.getValue('custpage_x_toopedate')) url += '&toopedate=' + n_format.format({value: record.getValue('custpage_x_toopedate'), type: n_format.Type.DATE});
            if (!!record.getValue('custpage_x_fromcontabdate')) url += '&fromcontab=' + n_format.format({value: record.getValue('custpage_x_fromcontabdate'), type: n_format.Type.DATE});
            if (!!record.getValue('custpage_x_tocontabdate')) url += '&tocontab=' + n_format.format({value: record.getValue('custpage_x_tocontabdate'), type: n_format.Type.DATE});
            if (!!record.getValue('custpage_x_sii_subsidiary')) url += '&subsidiary=' + record.getValue('custpage_x_sii_subsidiary');
            if (!!record.getValue('custpage_x_sii_tipopresentacion')) url += '&type=' + record.getValue('custpage_x_sii_tipopresentacion');
            if (!!record.getValue('custpage_x_entity')) url += '&entity=' + record.getValue('custpage_x_entity');
            if (!!record.getValue('custpage_x_tranid')) url += '&tranid=' + record.getValue('custpage_x_tranid');
            if (!!record.getValue('custpage_x_export')) url += '&expid=' + record.getValue('custpage_x_export');
            
            window.open(n_url.resolveScript({scriptId: 'customscript_x_sii_slmanualexport', deploymentId: 'customdeploy_x_sii_slmanualexport', returnExternalUrl: false}) + url, '_self');
        }
        //#endregion
        return {
            applyFilters: applyFilters
        };
    }); 
