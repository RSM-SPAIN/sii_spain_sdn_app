/**
 * Librería de presentación automática a la AEAT de las exportaciones SII.
 * Versión: 0.0.3
 * Fecha: 29/09/2020
 * @NApiVersion 2.0
 * @NModuleScope Public 
 */
define(['N/https/clientCertificate', 'N/file', 'N/xml', 'N/error', 'N/record', 'N/search', 'N/certificateControl', 'N/runtime', 'N/config', 'N/log', 'N/format'],
    function (n_https_cert, n_file, n_xml, n_error, n_record, n_search, n_cert_ctrl, n_runtime, n_config, n_log, n_format) {
        return {
            sendRequest: sendExports,
        }

        function sendExports(context) {
            context = typeof context == 'string' ? JSON.parse(context) : context;
            var results = !!context.exportId ? [context.exportId] : getExports();
            var exportId = context.exportId;

            if (!results) return false;

            for (var row in results) {
                var record = n_record.load({
                    type: 'customrecord_x_sii_tablaexportaciones',
                    id: results[row],
                    isDynamic: true
                });
                var url = getAEATUrls(
                    record.getValue({fieldId: 'custrecord_x_sii_subsidiary'}),
                    record.getValue({fieldId: 'custrecord_x_sii_sonfacturasemitidas'}),
                    record.getValue({fieldId: 'custrecord_x_sii_tipopresentacion'})
                );
                if (!url) continue;

                var content = n_file.load({
                    id: record.getValue({fieldId: 'custrecord_x_sii_ficheroexp'})
                }).getContents();
                if (!content) continue;

                var cert = getCertificateId(record.getValue({fieldId: 'custrecord_x_sii_subsidiary'}));
                if (!cert) continue;

                var parameters = {
                    'url': url,
                    'certId': cert,
                    'content': content,
                    'exportId': exportId
                };

                externalServiceCall(parameters);

                // var response = n_https_cert.post({
                //     url: url, certId: cert, body: content,
                //     headers: {'Content-Type': 'application/soap+xml'}
                // });

                // setLogMessage('Realizando envio a URL: '+ url ,exportId);

                // if (!!isSuccessStatusCode(response.code)) {
                //     var isWSExcepcion = checkWSExcepcion(response.body);
                      
                //     if (isWSExcepcion){ 
                //         getWSExcepcionError(response.body,exportId);
                //         errorXmlAEAT(response.code, response.body);
                //     }else{
                //         attachAEATResponse(exportId, record, response.body);
                //     }
                //     var body = xmlParse(response.body, exportId);
                //     !!body ? updateExportLines(body, record) : errorXmlAEAT(response.code, response.body);
                // } else {
                //     getWSExcepcionError(response.body,exportId);
                //     errorXmlAEAT(response.code, response.body);
                // }
            }

            //#region UTILS
            function getExports() {
                var list = [];
                n_search.load({id: 'customsearch_x_sii_exppdte_autosync'}).run().each(
                    function (result) {
                        list.push(result.getValue({name: 'internalid'}));
                        return true;
                    }
                );
                return list.length > 0 ? list : null;
            }

            function getCertificateId(subsidiary) {
                if (!isOneWorld()) {
                    var key = n_config.load({type: n_config.Type.COMPANY_INFORMATION})
                    .getText({fieldId: 'custrecord_x_sii_certificate'});
                } else {
                    var key = ((n_search.lookupFields({
                        type: 'subsidiary',id: subsidiary,
                        columns: 'custrecord_x_sii_certificate'
                    }).custrecord_x_sii_certificate || [])[0] || {}).text;
                }
                var cert = (n_cert_ctrl.findCertificates({name: key}) || [])[0];
                return !!cert ? cert.id : null;
            }

            function getAEATUrls(subsidiary, emitted, syncType) {
                var toSandbox = null, prdurl = null, sbxurl = null;
                var trans_ids = {
                    true: ['7', '10'],
                    false: ['17', '20']
                };

                n_search.create({
                    type: 'customrecord_x_sii_settings',
                    filters: [
                        ['custrecord_x_siiset_subsidiaries', 'anyof', subsidiary || '1'], 'and',
                        ['custrecord_x_siiws_parent.custrecord_x_siiws_transtype', 'anyof', trans_ids[emitted]], 'and',
                        ['custrecord_x_siiws_parent.custrecord_x_siiws_synctype', 'anyof', syncType]
                    ],
                    columns: [
                        n_search.createColumn({name: 'custrecord_x_siiset_tosandbox'}),
                        n_search.createColumn({name: 'internalid'}),
                        n_search.createColumn({name: 'custrecord_x_siiws_prdurl', join: 'custrecord_x_siiws_parent'}),
                        n_search.createColumn({name: 'custrecord_x_siiws_sbxurl', join: 'custrecord_x_siiws_parent'})
                    ]
                }).run().each(function (result) {
                    toSandbox = result.getValue({name: 'custrecord_x_siiset_tosandbox'});
                    prdurl = result.getValue({name: 'custrecord_x_siiws_prdurl', join: 'custrecord_x_siiws_parent'});
                    sbxurl = result.getValue({name: 'custrecord_x_siiws_sbxurl', join: 'custrecord_x_siiws_parent'});
                });

                return (n_runtime.envType == 'SANDBOX' || !!toSandbox) ? sbxurl : prdurl;
            }

            function isSuccessStatusCode(code) { return !!(code + '').match(/^[2]/g); }

            function isOneWorld() { return !!n_runtime.isFeatureInEffect({feature: 'SUBSIDIARIES'}) }

            function xmlParse(xml, exportId) {
                var response = {};
                var document = n_xml.Parser.fromString({text: xml});

                if (!(n_xml.XPath.select({node: document, xpath: '//faultcode'}) || [])[0]) {
                    var eNode = (n_xml.XPath.select({node: document, xpath: '//siiR:RespuestaLRFacturasEmitidas'}) || [])[0];
                    var rNode = (n_xml.XPath.select({node: document, xpath: '//siiR:RespuestaLRFacturasRecibidas'}) || [])[0];

                    if (!!eNode || !!rNode) {
                        var status = ((!!eNode ? eNode : rNode).getElementsByTagName({tagName: 'siiR:EstadoEnvio'}) || [])[0];
                        var csv_code = ((!!eNode ? eNode : rNode).getElementsByTagName({tagName: 'siiR:CSV'}) || [])[0];
                        var line_node = n_xml.XPath.select({node: document, xpath: '//siiR:RespuestaLinea'});
                        var emitter_node = !!rNode ? n_xml.XPath.select({node: document, xpath: '//sii:IDEmisorFactura'}) : null;
                        var idOtro_node = !!rNode ? n_xml.XPath.select({node: document, xpath: '//sii:IDOtro'}) : null;
                        response['respuestaglobal'] = !!status ? status.textContent : '';
                        response['codigocsv'] = !!csv_code ? csv_code.textContent : '';

                      var idOtroNum = 0;
                        for (var row in line_node) {
                          	var serie = (line_node[row].getElementsByTagName({tagName: 'sii:NumSerieFacturaEmisor'}) || [])[0];
                            var nif = "";
                            if (rNode != null){
                              nif = !!emitter_node ? (emitter_node[row].getElementsByTagName({tagName: 'sii:NIF'}) || [])[0] : null;
                              if (!nif && !!idOtro_node && !!emitter_node[row].hasChildNodes()) {
                                  nif = (idOtro_node[idOtroNum++].getElementsByTagName({tagName: 'sii:ID'}) || [])[0];
                              }
                            }
                            var status = (line_node[row].getElementsByTagName({tagName: 'siiR:EstadoRegistro'}) || [])[0];
                            var code = (line_node[row].getElementsByTagName({tagName: 'siiR:CodigoErrorRegistro'}) || [])[0]
                            var description = (line_node[row].getElementsByTagName({tagName: 'siiR:DescripcionErrorRegistro'}) || [])[0]
                            if (!serie) continue;

                            response[serie.textContent + (!!nif ? nif.textContent : '')] = {
                                'estadoRegistro': status.textContent,
                                'codigoErrorRegistro': !!code ? code.textContent : '',
                                'descripcionErrorRegistro': !!description ? description.textContent : ''
                            }
                        }

                        return response;
                    } else {
                        getWSExcepcionError(xml, exportId);
                        errorXmlAEAT('200', xml);
                    }
                } else {
                    getWSExcepcionError(xml, exportId);
                    errorXmlAEAT('200', xml);
                }
            }

            function updateExportLines(response, record) {
                var transaction_status = {
                    'correcto': '1',
                    'aceptado con errores': '2',
                    'aceptado_con_errores': '2',
                    'aceptadoconerrores': '2',
                    'incorrecto': '3',
                    'exportado': '4'
                };
                var export_status = {
                    'correcto': '1',
                    'parcialmente correcto': '2',
                    'parcialmente_correcto': '2',
                    'parcialmentecorrecto': '2',
                    'incorrecto': '3'
                };

                record.setValue('custrecord_x_sii_respuestaglobal', export_status[response.respuestaglobal.toLowerCase()]);
                record.setValue('custrecord_x_sii_codigocsv', response.codigocsv);
                record.setValue('isinactive', true);

                for (var i = 0; i < record.getLineCount({sublistId: 'recmachcustrecord_x_le_exportacion'}); i++) {
                    var transaction = record.getSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_tran_number', i) || 
                        record.getSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_transaccion_display', i).split('#')[1];
                    var recordtype = record.getSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_recordtype', i);
                    var nif = "";
                    var nifSinES = "";
                    if (recordtype == "vendorbill" || recordtype == "vendorcredit" || recordtype == "creditcardcharge" || recordtype == "creditcardrefund" ) {
                        nif = record.getSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_tran_nif', i);
                        nifSinES = nif.lastIndexOf('ES', 0) === 0 ? nif.slice(2) : '';
                    }

                    for (var serie in response) {

                        if ((transaction + nif) == serie || (transaction + nifSinES) == serie ) {
                            var line = record.selectLine('recmachcustrecord_x_le_exportacion', i);
                            line.setCurrentSublistValue('recmachcustrecord_x_le_exportacion','custrecord_x_le_estadofactura', transaction_status[response[serie].estadoRegistro.toLowerCase()]);
                            line.setCurrentSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_codigoerrorregistro', response[serie].codigoErrorRegistro);
                            line.setCurrentSublistValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_descripcionerrorregistr', response[serie].descripcionErrorRegistro);
                            line.commitLine('recmachcustrecord_x_le_exportacion');

                            break;
                        }
                    }
                }

                record.save({enableSourcing: true, ignoreMandatoryFields: true});
            }

            function errorXmlAEAT(code, body) {
                var err = n_error.create({
                    name: code,
                    message: body
                });
                err.toString = function () { return err.message };
                throw err;
            }

            function attachAEATResponse(exportId, record, xml) {
                var exportName = record.getValue({fieldId: 'name'});
                var fileObj = n_file.create({
                    name: "RES_" + exportName + "_" + new Date().getTime() + '.xml',
                    fileType: n_file.Type.XMLDOC,
                    contents: xml,
                });
                
                fileObj.folder = -15;
                var fileId = fileObj.save();

                n_record.attach({
                    record: {type: 'file', id: fileId},
                    to: {type: 'customrecord_x_sii_tablaexportaciones', id: exportId}
                });
            }
            
            function checkWSExcepcion(body) {
                return body.indexOf('WSExcepcion') >= 0;
            }

            function getWSExcepcionError(body, exportId) {
                var xml = n_xml.Parser.fromString({text: body});
                if (!!(n_xml.XPath.select({node: xml, xpath: '//faultcode'}) || [])[0]) {
                    var fault_string_node = (n_xml.XPath.select({node: xml, xpath: '//faultstring'}) || [])[0];
                    var message = !!fault_string_node ? fault_string_node.textContent : body;
                } else {
                    var message = body;
                }

                var record = n_record.create({type: 'customrecord_x_sii_exportaciones_log'});
                record.setValue('custrecord_x_sii_exp_log_msg', message);
                record.setValue('custrecord_x_sii_exp_log_exportacion', exportId);
                record.save();
            }

            function setLogMessage(message ,exportId) {

                log.audit('setLogMessage', message + ' / '+ exportId) 
                var record = n_record.create({type: 'customrecord_x_sii_exportaciones_log'});
                record.setValue('custrecord_x_sii_exp_log_msg', message);
                record.setValue('custrecord_x_sii_exp_log_exportacion',  exportId);
                record.save();
            }

            function externalServiceCall(parameters) {
                var counter = 1;
                var exit = false;
                var errorAfterRetry;
                do {
                    try {
                        setLogMessage('Realizando envio a URL: '+ url ,exportId);
                        var response = n_https_cert.post({
                            url: parameters.url, certId: parameters.certId, body: parameters.content,
                            headers: {'Content-Type': 'application/soap+xml'}
                        });								

                        if (!!isSuccessStatusCode(response.code) || response.code == 200) {
                            status = 'true';
                            exit = true;

                            var isWSExcepcion = checkWSExcepcion(response.body);
                      
                            if (isWSExcepcion){ 
                                getWSExcepcionError(response.body,exportId);
                                errorXmlAEAT(response.code, response.body);
                            }else{
                                attachAEATResponse(exportId, record, response.body);
                            }
                            var body = xmlParse(response.body, exportId);
                            !!body ? updateExportLines(body, record) : errorXmlAEAT(response.code, response.body);

                        } else if (response.code != 200) {
                            var responsecode = "NetSuite received a non-200 response code: " + response.code;
                            setLogMessage(responsecode,parameters.exportId);
                            getWSExcepcionError(response.body,exportId);
                            errorXmlAEAT(response.code, response.body);
                        }
                    } catch (error) {

                        errorAfterRetry = error;

                        if (error.type == "error.SuiteScriptError") {
                            //log.audit('error.SuiteScriptError', error.name);
                            var errordetails;
                            var errorcode = error.name;
                            switch (errorcode) {
                                case "SSS_REQUEST_TIME_EXCEEDED":
                                    errordetails = "Connection closed because it has exceed the time out period (NetSuite has not received a response after 5 seconds on initial connection or after 45 seconds on the request). Executing retry #: " + counter;
                                    break;
                                case "SSS_CONNECTION_TIME_OUT":
                                    errordetails = "Connection closed because it has exceed the time out period (NetSuite has not received a response after 5 seconds on initial connection or after 45 seconds on the request). Executing retry #: " + counter;
                                    break;
                                case "SSS_CONNECTION_CLOSED":
                                    errordetails = "Connection closed because it was unresponsive. Executing retry #: " + counter;
                                    break;
                                case "SSS_INVALID_URL":
                                    errordetails = "Connection closed because of an invalid URL.  The URL must be a fully qualified HTTP or HTTPS URL if it is referencing a non-NetSuite resource.  The URL cannot contain white space.";
                                    exit = true;
                                    break;
                                case "SSS_TIME_LIMIT_EXCEEDED":
                                    errordetails = "NetSuite Suitescript execution time limit of 180 seconds exceeded. Exiting script.";
                                    exit = true;
                                    break;
                                case "SSS_USAGE_LIMIT_EXCEEDED":
                                    errordetails = "NetSuite User Event Suitescript usage limit of 1000 units exceeded. Exiting script.";
                                    exit = true;
                                    break;
                                default:
                                    errordetails = error.message + ".  Executing retry #: " + counter;
                            }
                            counter += 1;
                            log.audit('Process Error', errorcode + ': ' + errordetails);
                        } else {
                            log.audit('Unexpected Error', error.message);
                            exit = true;
                            if(response){
                                getWSExcepcionError(response.body,exportId);
                                errorXmlAEAT(response.code, response.body);
                            }else{
                                error.toString = function () {
                                    return error.message
                                };
                                throw error;
                            }

                            break;
                        }
                    }
                } while (exit == false && counter < 6)

                if(counter >= 6){
                    throw errorAfterRetry;
                }

            }
            //#endregion
        }
    }
);