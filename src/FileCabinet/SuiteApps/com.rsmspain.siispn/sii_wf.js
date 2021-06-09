/**
 * Workflow para la asociación de exportaciones y control de campos de las transacciones en SII 2.0
 * Versión: 0.0.3
 * Fecha: 02/06/2020
 */

function siiWfOnBeforeSubmit(workflow_id, type, form) {
    var rectype = nlapiGetRecordType();

    switch (rectype) {
        case 'invoice': case 'creditmemo': case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund': case 'cashrefund': case 'cashsale':
            //set code
            break;
    }
}

function siiWfOnAfterSubmit(workflow_id, type, form) {
    var rectype = nlapiGetRecordType();

    switch (rectype) {
        case 'invoice': case 'creditmemo': case 'vendorbill': case 'vendorcredit': case 'creditcardcharge': case 'creditcardrefund': case 'cashrefund': case 'cashsale':
            if (type == 'create' || type == 'copy') setDefaultValuesOnTransWF(rectype);
            if (type != 'delete' && type != 'xedit') setExportWF(rectype, nlapiGetRecordId());
            break;
    }
}