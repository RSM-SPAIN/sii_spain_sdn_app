/**
 * Envio manual de exportaciones SII
 * Versión: 0.0.1
 * Fecha: 18/03/2020
 * @NApiVersion 2.0
 * @NScriptType Restlet
 * @NModuleScope Public
 * @NAmdConfig  ./sii_config.json
 */

define(['N/log', 'N/record', 'sii'],
    function(n_log, n_record, n_sii) {
        return { post: _post, put: _put };

        function _post(body) {
            n_sii.sendRequest(body);
            return '0';
        }

        function _put(body) {
            if (!body) throw 'Body not found';

            body = typeof body == 'string' ? JSON.parse(body) : body;
            if (!body.recordtype) throw 'Missing recordtype';
            if (!body.id) throw 'Missing id';
            if (!body.values) throw 'Missing values';

            n_record.submitFields({type: body.recordtype, id: body.id, values: body.values, options: {enableSourcing: true, ignoreMandatoryFields : true}});
            return '0';
        }
    }
)
