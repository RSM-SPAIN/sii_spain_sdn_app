/**
 * Libreria de generación del documento XML de presentación a la AEAT (SII 2.0)
 * Versión: 0.0.1
 * Fecha: 31/05/2020
 * sii_genfile
 *
 * MODIFCACIONES:
 * - 0.0.1: Se ha modificado las posiciones de los importes de credit y debit en el detalle de las líneas de las facturas emitidas, ya que no existe las columnas de subsidiaria en no-oneworld.
 */

var customer = getCustomerType();
var logs = {header: null, lines: {}};

//#region MAIN
function getSiiDocument(values, emitted, envelope, download) {
    try {
        if (!values || values.getValue('custrecord_x_sii_tipoenvioaeat') == 2) return true; //2 es baja
        envelope = envelope.replace(/&lt;?/g, '<').replace(/&gt;?/g, '>');

        var ids = [], filters = [], columns = [];
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_x_le_exportacion', null, 'anyof', values.getId()));
        columns.push(new nlobjSearchColumn('custrecord_x_le_transaccion'));

        var results = nlapiSearchRecord('customrecord_x_sii_lineasexportaciones', null, filters, columns);
        if (!results) return true;
        for (var row in results) ids.push(results[row].getValue('custrecord_x_le_transaccion'));

        var slrf = !!emitted ? new SuministroLRFacturasEmitidas(envelope) : new SuministroLRFacturasRecibidas(envelope);
        var exportfacemiType = customer == 'customermain' ? 'customsearch_x_sii_exportfacemi_job':'customsearch_x_sii_exportfacemi';
        var view = !!emitted ? exportfacemiType : 'customsearch_x_sii_exportfacreci';
        var results = ultraSearch('transaction', view, [new nlobjSearchFilter('internalid', null, 'anyof', ids)]);
        var record = nlapiLoadRecord('customrecord_x_sii_tablaexportaciones', values.getId());

        slrf.Cabecera = getHeader(values);
        slrf = !!emitted ? getEmitidas(slrf, results) : getRecibidas(slrf, results);
        if (!logs.header) {
            if (!!download) {
                console.log('toXML', slrf.toXML());
                download(values.getValue('name') + '.xml', parseChar(slrf.toXML()));
            } else {
                var file = nlapiCreateFile(values.getValue('name') + '.xml', 'XMLDOC', parseChar(slrf.toXML()));
                file.setFolder(-15);
                var id = nlapiSubmitFile(file);
                nlapiAttachRecord('file', id, 'customrecord_x_sii_tablaexportaciones', values.getId());
                record.setFieldValue('custrecord_x_sii_ficheroexpgenerado', 'T');
                record.setFieldValue('custrecord_x_sii_ficheroexp', id);
                record.setFieldValue('custrecord_x_sii_urlficheroexp', nlapiLoadFile(id).getURL());
            }
            record.setFieldValue('custrecord_x_sii_errormsg', 'OK');
        } else {
            record.setFieldValue('custrecord_x_sii_errormsg', logs.header);
        }

        record.setFieldValue('custrecord_x_sii_generarfichero', 'F');
        for (var key in logs.lines) {
            var find = record.findLineItemValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_transaccion', key);
            if (find > 0) {
                record.setLineItemValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_codigoerrorregistro', find, logs.lines[key].code);
                record.setLineItemValue('recmachcustrecord_x_le_exportacion', 'custrecord_x_le_descripcionerrorregistr', find, logs.lines[key].details);
            }
        }
        nlapiSubmitRecord(record, true, true);

        return true;
    } catch (e) {
        nlapiLogExecution('ERROR', 'e', JSON.stringify(e))
        nlapiSubmitField('customrecord_x_sii_tablaexportaciones', values.getId(), 'custrecord_x_sii_errormsg', e.code);
        return false;
    }
}
//#endregion

//#region UTILS
function getHeader(values) {
    var header = new Cabecera();
    header.IDVersionSii = '1.1';
    header.Titular.NombreRazon = !!values.getValue('legalname', 'custrecord_x_sii_subsidiary') ?
        values.getValue('legalname', 'custrecord_x_sii_subsidiary') : values.getValue('name', 'custrecord_x_sii_subsidiary');
    header.Titular.NombreRazon = limpiarCharXML(header.Titular.NombreRazon);
    header.Titular.NIF = values.getValue('taxidnum', 'custrecord_x_sii_subsidiary');

    switch (values.getValue('custrecord_x_sii_tipoenvioaeat')) {
        case '1': header.TipoComunicacion = 'A0'; break; //Alta
        case '2': break; //Baja
        case '3': header.TipoComunicacion = 'A1'; break; //Modificación
    }

    return header;
}

function getContraparte(name, id, typeid, country, emitter) {
    var cp = new Contraparte();
    cp.NombreRazon = limpiarCharXML(name);

    switch (typeid || '01') {
        case '01': cp.NIF = (id || '').replace(/^ES/g, ''); return cp;
        case '02':
            if((id || '').substring(0, 2).toUpperCase() != country.toUpperCase() && !!emitter && country.toUpperCase() != 'GR'){
                cp.IDOtro.ID = (country + id)
            }else if((id || '').substring(0, 2).toUpperCase() != 'EL' && !!emitter && country.toUpperCase() == 'GR'){//EXCEPCION VIES GRECIA
                cp.IDOtro.ID = ('EL' + id)
            }else{
                cp.IDOtro.ID = id;
            }
            break;
        case '07': !!emitter ? cp.NIF = id : cp.IDOtro.ID = id; break;
        default: cp.IDOtro.ID = limpiarCharXML(id); break;
    }

    cp.IDOtro.CodigoPais = country;
    cp.IDOtro.IDType = typeid;

    return cp;
}

function dateFormat(d) {
    if (!d) return null;
    var aux = d instanceof Date ? d : nlapiStringToDate(d);
    var month = parseInt(aux.getMonth(), 10) + 1;
    return {
        day: (aux.getDate() + '').length > 1 ? aux.getDate() : ('0' + aux.getDate()),
        month: (month + '').length > 1 ? month : ('0' + month),
        year: aux.getFullYear(),
        date: function() {return this.day + '-' + this.month + '-' + this.year}
    }
}

function parseChar(input) {
    return (input || '').toString().trim().replace(/(à|á|â|ä)/g, 'a').replace(/(è|é|ê|ë)/g, 'e').replace(/(ì|í|î|ï)/g, 'i')
        .replace(/(ò|ó|ô|ö)/g, 'o').replace(/(ù|ú|ü|û)/g, 'u').replace(/ç/g, 'c').replace(/ñ/g, 'n').replace(/(À|Á|Â|Ä)/g, 'A')
        .replace(/(È|É|Ê|Ë)/g, 'E').replace(/(Ì|Í|Î|Ï)/g, 'I').replace(/(Ò|Ó|Ô|Ö)/g, 'O').replace(/(Ù|Ú|Ü|Û)/g, 'U').replace(/Ç/g, 'C').replace(/Ñ/g, 'N');
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else { pom.click(); }
}

function ultraSearch(recordType, searchId, filters, columns) {
    var savedSearch = nlapiLoadSearch(recordType, searchId);
    if (!!filters) savedSearch.addFilters(filters);
    if (!!columns) savedSearch.addColumns(columns);

    var resultset = savedSearch.runSearch();
    var returnSearchResults = [], searchid = 0;
    do {
        var resultslice = resultset.getResults(searchid, searchid + 1000);
        if (!resultslice) return null;
        for (var rs in resultslice) {
            returnSearchResults.push(resultslice[rs]);
            searchid++;
        }
    } while (resultslice.length >= 1000);

    return returnSearchResults;
}
//#endregion

//#region Funciones Genera Fichero LR Facturas
function getEmitidas(slrf, results) {
    var mapIds = {};
    for (var row in results) {
        if (!!mapIds.hasOwnProperty(results[row].getValue('internalid', null, 'GROUP')) || hasErrors(results[row])) continue;

        logs.lines[results[row].getValue('internalid', null, 'GROUP')] = {code: 'OK', details: ''};
        mapIds[results[row].getValue('internalid', null, 'GROUP')] = results[row];

        var rlrf = new RegistroLRFacturasEmitidas();
        var tranDateValue = results[row].getValue('trandate', null, 'MAX');
        var trandate = dateFormat(tranDateValue);
        var fechaOperacionValue = results[row].getValue('custbody_x_sii_fecha_operacion', null, 'MAX');
        var fechaOperacion = fechaOperacionValue? dateFormat(fechaOperacionValue) : '';
        var fechaLiquidacion = dateFormat(fechaOperacionValue || tranDateValue);

        rlrf.PeriodoLiquidacion.Ejercicio = fechaLiquidacion.year;
        rlrf.PeriodoLiquidacion.Periodo = fechaLiquidacion.month;
        rlrf.IDFactura.IDEmisorFactura.NIF = slrf.Cabecera.Titular.NIF;
        rlrf.IDFactura.NumSerieFacturaEmisor = results[row].getValue('tranid', null, 'MAX').replace(/\\/g, '');
        rlrf.IDFactura.FechaExpedicionFacturaEmisor = trandate.date();

        var fe = rlrf.FacturaExpedida;

        if((fechaOperacionValue !== tranDateValue) &&  fechaOperacion){
            fe.FechaOperacion = fechaOperacion.date();
        }

        fe.TipoFactura = results[row].getValue('custrecord_x_l2_emi_codigo', 'custbody_x_sii_tipofacturaemitida', 'MAX');
        if (fe.tipoFactura == 'F4') {
            rlrf.IDFactura.NumSerieFacturaEmisor = results[row].getValue('custbody_xnumfacini', null, 'MAX').replace(/\\/g, '');
            rlrf.IDFactura.NumSerieFacturaEmisorResumenFin = results[row].getValue('custbody_xnumfacfin', null, 'MAX');
        }

        fe.NumRegistroAcuerdoFacturacion = results[row].getValue('custbody_x_sii_num_reg_acuerdofact', null, 'MAX');

        fe.ClaveRegimenEspecialOTrascendencia = results[row].getValue('custrecord_x_l3_1_codigo', 'custbody_x_sii_claveregimenexpedidas', 'MAX');
        if (!!results[row].getValue('custbody_x_sii_claveregimen_ad1_exp', null, 'MAX')) fe.ClaveRegimenEspecialOTrascendenciaAdicional1 = results[row].getValue('custbody_x_sii_claveregimen_ad1_exp', null, 'MAX');
        if (!!results[row].getValue('custbody_x_sii_claveregimen_ad2_exp', null, 'MAX')) fe.ClaveRegimenEspecialOTrascendenciaAdicional1 = results[row].getValue('custbody_x_sii_claveregimen_ad2_exp', null, 'MAX');
        fe.DescripcionOperacion = limpiarCharXML(results[row].getValue('memomain', null, 'MAX'));
        if (results[row].getValue('custbody_x_sii_emitidaporterceros', null, 'MAX') == 'T') fe.EmitidaPorTercerosODestinatario = 'S';
        if (!!results[row].getValue('custrecord_x_l5_codigo', 'custbody_x_sii_tiporectificativa', 'MAX')) {
            fe.TipoRectificativa = results[row].getValue('custrecord_x_l5_codigo', 'custbody_x_sii_tiporectificativa', 'MAX');
            if (fe.TipoRectificativa == 'S') {
                fe.ImporteRectificacion.BaseRectificada = 0;
                fe.ImporteRectificacion.CuotaRectificada = 0;
            }
        }

        if (fe.TipoFactura != 'F2' && fe.TipoFactura != 'F4' && fe.TipoFactura != 'R5') {
            if (results[row].getValue('isperson', customer, 'MAX') == 'F') {
                var nombre = results[row].getValue('companyname', customer, 'MAX');
            } else {
                var nombre = [results[row].getValue('lastname', customer, 'MAX'), results[row].getValue('firstname', customer, 'MAX')];
                if (!!results[row].getValue('middlename', customer, 'MAX')) nombre.push(results[row].getValue('middlename', customer, 'MAX'));
                nombre = nombre.join(', ');
            }

            fe.Contraparte = getContraparte(
                nombre,
                results[row].getValue('vatregnumber', customer, 'MAX'),
                results[row].getValue('custentity_x_sii_tipoidentificacioncode', customer, 'MAX'),
                results[row].getValue('custentity_x_sii_paisiso', customer, 'MAX'),
                true);
        }

        fe = getDesglose(fe, results, results[row]);

        if (fe.ClaveRegimenEspecialOTrascendencia == '05') { //REAV
            fe.ImporteTotal = results[row].getValue('total', null, 'MAX');

            if (!results[row].getValue('custrecord_x_l9_codigo', 'custbody_x_sii_causaexencion', 'MAX')) { //No exenta
                fe.desgloseNormal = new DesgloseFacturaEmi();
                fe.desgloseNormal.Sujeta.NoExenta.TipoNoExenta = 'S1';
                var die = new DetalleIVAEmi();
                die.TipoImpositivo = null;
                die.BaseImponible = 0;
                die.CuotaRepercutida = '';
                die.TipoRecargoEquivalencia = '';
                die.cuotaRecargoEquivalencia = '';
                fe.TipoDesglose.DesgloseFactura.Sujeta.NoExenta.DesgloseIVA.DetalleIVAEmi.push(die);
            } else { //exenta
                fe.desgloseNormal = new DesgloseFacturaEmi();
                fe.desgloseNormal.Sujeta.Exenta.DetalleExenta.CausaExencion = 'E6';
                fe.desgloseNormal.Sujeta.Exenta.DetalleExenta.BaseExenta = 0;
            }
        }
        slrf.RegistroLRFacturasEmitidas.push(rlrf);
    }

    return slrf;

    function getDesglose(fe, results, values) {
        var multibook = false;

        if (fe.TipoFactura != 'F2' && fe.TipoFactura != 'F4' && fe.TipoFactura != 'R5' &&
            (!fe.Contraparte.IDOtro.IDType || fe.Contraparte.IDOtro.IDType == '07') && fe.Contraparte.NIF.indexOf('N') != 0) {
            var dfe = new DesgloseFacturaEmi();

            for (var row in results) {
                if (!values || results[row].getValue('internalid', null, 'GROUP') != values.getValue('internalid', null, 'GROUP')) continue;
                dfe = getLineDetails(dfe, results[row]);
            }

            if (!!dfe.Sujeta.NoExenta.DesgloseIVA.DetalleIVAEmi && dfe.Sujeta.NoExenta.DesgloseIVA.DetalleIVAEmi.length > 0){
                var TipoNoExenta = values.getValue('custrecord_x_l7_codigo', 'custbody_x_sii_tipooperacion', 'MAX');
                if (!TipoNoExenta){
                    dfe.Sujeta.NoExenta.TipoNoExenta = 'RellenarEnFactura'; //No existe este código pero nos es util para indicar que no hay Tipo de Operación indicado en la factura
                    //El sistema arrojara un error a la linea y no volvera a aparecer la etiqueta <sii:TipoDesglose></sii:TipoDesglose> vacía.
                }else{
                    dfe.Sujeta.NoExenta.TipoNoExenta = values.getValue('custrecord_x_l7_codigo', 'custbody_x_sii_tipooperacion', 'MAX');
                }
            }

            fe.TipoDesglose.DesgloseFactura = dfe;
        } else {
            var dto = new DesgloseTipoOperacion();
            var ps = new PresentacionServicios();
            var e = new Entrega();

            for (var row in results) {
                if (!values || results[row].getValue('internalid', null, 'GROUP') != values.getValue('internalid', null, 'GROUP')) continue;
                if (results[row].getValue('formulatext', null, 'GROUP') == 'T') { //prestacion de servicios
                    ps = getLineDetails(ps, results[row]);
                } else { //entrega de bienes
                    e = getLineDetails(e, results[row]);
                }
            }

            if (!!ps.Sujeta.NoExenta.DesgloseIVA.DetalleIVAEmi && ps.Sujeta.NoExenta.DesgloseIVA.DetalleIVAEmi.length > 0)
                ps.Sujeta.NoExenta.TipoNoExenta = values.getValue('custrecord_x_l7_codigo', 'custbody_x_sii_tipooperacion', 'MAX');
            if (!!e.Sujeta.NoExenta.DesgloseIVA.DetalleIVAEmi && e.Sujeta.NoExenta.DesgloseIVA.DetalleIVAEmi.length > 0)
                e.Sujeta.NoExenta.TipoNoExenta = values.getValue('custrecord_x_l7_codigo', 'custbody_x_sii_tipooperacion', 'MAX');

            dto.PresentacionServicios = ps;
            dto.Entrega = e;

            fe.TipoDesglose.DesgloseTipoOperacion = dto;
        }

        return fe;

        function getLineDetails(o, values) {

            var recargoEquivalenciaMap = {
                "26.20" : [21, 5.20],
                "11.40" : [10, 1.40],
                "4.50" : [4, 0.50]
            };

            if (!!o && !!values) {
                var cols = values.getAllColumns();
                var importe_credit = !!nlapiGetContext().getFeature('SUBSIDIARIES') ? cols[29] : cols[27];
                var importe_debit = !!nlapiGetContext().getFeature('SUBSIDIARIES') ? cols[30] : cols[28];

                var tiposImpositivosRecargo = recargoEquivalenciaMap[parseFloat(values.getValue('rate', 'taxitem', 'GROUP')).toFixed(2)];

                if (values.getValue('exempt', 'taxitem', 'GROUP') == 'T' && !tiposImpositivosRecargo) {//Para tax agrupados como el de recargo de equivalencia, en la busqueda, Netsuite indica erroneamente que es exento.
                    //Detalle exenta solo 1 por factura (Si admite 1 a 7)
                    var detalleE =  new DetalleExenta();
                    detalleE.CausaExencion = values.getValue('custrecord_x_l9_codigo', 'custbody_x_sii_causaexencion', 'MAX') || 'E6';
                    detalleE.BaseImponible = +(parseFloat(o.Sujeta.Exenta.DetalleExenta.BaseImponible || 0) + (values.getValue(importe_credit) - values.getValue(importe_debit))).toFixed(2);
                    o.Sujeta.Exenta.DetalleExenta.push(detalleE);
                } else if (values.getValue('custrecord_x_sii_tiponosujeta', 'taxitem', 'GROUP') == 1) {
                    o.NoSujeta.ImportePorArticulos7_14_Otros = +(parseFloat(o.NoSujeta.ImportePorArticulos7_14_Otros || 0) + (values.getValue(importe_credit) - values.getValue(importe_debit))).toFixed(2);
                } else if (values.getValue('custrecord_x_sii_tiponosujeta', 'taxitem', 'GROUP') == 2) {
                    o.NoSujeta.ImporteTAIReglasLocalizacion = +(parseFloat(o.NoSujeta.ImporteTAIReglasLocalizacion || 0) + (values.getValue(importe_credit) - values.getValue(importe_debit))).toFixed(2);
                } else {//SUJETA NO EXENTA
                    var die = new DetalleIVAEmi();


                    if(tiposImpositivosRecargo){//Recargo de equivalencia solo aplica a transacciones nacionales  21%, 10% y 4%
                        die.TipoImpositivo = parseInt(tiposImpositivosRecargo[0], 10) || 0;
                        die.BaseImponible = (values.getValue(importe_credit) - values.getValue(importe_debit)).toFixed(2)
                        //Sin Multibook
                        die.CuotaRepercutida = (die.BaseImponible * die.TipoImpositivo / 100).toFixed(2);
                        die.TipoRecargoEquivalencia = parseFloat(tiposImpositivosRecargo[1]).toFixed(2) || 0;
                        die.CuotaRecargoEquivalencia = (die.BaseImponible * die.TipoRecargoEquivalencia / 100).toFixed(2);
                    }else{
                        die.TipoImpositivo = parseInt(values.getValue('rate', 'taxitem', 'GROUP'), 10) || 0;
                        die.BaseImponible = (values.getValue(importe_credit) - values.getValue(importe_debit)).toFixed(2);
                        die.CuotaRepercutida = !!multibook ? (die.BaseImponible * die.TipoImpositivo / 100).toFixed(2) : (values.getValue('taxamount', null, 'SUM') * 1).toFixed(2);
                        die.TipoRecargoEquivalencia = '';
                        die.CuotaRecargoEquivalencia = '';
                    }
                    o.Sujeta.NoExenta.DesgloseIVA.DetalleIVAEmi.push(die);
                }
            }

            return o;
        }
    }

    function hasErrors(row) {
        try {
            if (row.getValue('custrecord_x_l2_emi_codigo', 'custbody_x_sii_tipofacturaemitida', 'MAX') == 'F4' && (
                !row.getValue('custbody_xnumfacini', null, 'MAX') || !row.getValue('custbody_xnumfacfin', null, 'MAX'))) {
                throw nlapiCreateError('MISSING_DATA', 'Número de factura inicial o final no especificado para tipo de factura F4');
            }

            return false;
        } catch (e) {
            nlapiLogExecution('ERROR', row.getValue('internalid', null, 'GROUP'), e.code)
            logs.header = 'Error en la generación del fichero de exportación';
            logs.lines[row.getValue('internalid', null, 'GROUP')] = {code: e.code, details: e.details};
            return true;
        }
    }
}

function getRecibidas(slrf, results) {
    var mapIds = {};

    for (var row in results) {
        if ((!!mapIds.hasOwnProperty(results[row].getValue('internalid', null, 'GROUP')) || hasErrors(results[row])) && results[row].getValue('custrecord_x_sii_iva_aduanas', 'taxitem', 'GROUP') != 'T' ) continue;

        logs.lines[results[row].getValue('internalid', null, 'GROUP')] = {
            code: 'OK',
            details: ''
        };
        mapIds[results[row].getValue('internalid', null, 'GROUP')] = results[row];

        var rlrf = new RegistroLRFacturasRecibidas();
        var tranDateValue = results[row].getValue('trandate', null, 'MAX');
        var trandate = dateFormat(results[row].getValue('trandate', null, 'MAX'));
        var fechaOperacionValue = results[row].getValue('custbody_x_sii_fecha_operacion', null, 'MAX');
        var fechaOperacion = fechaOperacionValue ? dateFormat(fechaOperacionValue) : '';
        var fechaEmisionValue = results[row].getValue('custbody_x_sii_fechaemision', null, 'MAX');
        var fechaLiquidacion = dateFormat(tranDateValue);

        rlrf.PeriodoLiquidacion.Ejercicio = fechaLiquidacion.year;
        rlrf.PeriodoLiquidacion.Periodo = fechaLiquidacion.month;
        rlrf.IDFactura.NumSerieFacturaEmisor = results[row].getValue('tranid', null, 'MAX').replace(/\\/g, '');
        rlrf.IDFactura.FechaExpedicionFacturaEmisor = dateFormat(fechaEmisionValue).date();

        var fr = rlrf.FacturaRecibida;

        if (fechaOperacion) {
            fr.FechaOperacion = fechaOperacion.date();
        }

        fr.FechaRegContable = dateFormat(results[row].getValue('custbody_x_sii_fechacontab', null, 'MAX')).date();
        fr.TipoFactura = results[row].getValue('custrecord_x_l2_reci_codigo', 'custbody_x_sii_tipofacturarecibida', 'MAX');

        var ifAdeducirPerPosterior = results[row].getValue('custbody_x_sii_deduc_periodo_posterior', null, 'GROUP');

        if (ifAdeducirPerPosterior == 'T') {
            fr.ADeducirEnPeriodoPosterior = 'S'
            var deductionDate = dateFormat(results[row].getValue('custbody_x_sii_ejer_periodo_deduccion', null, 'MAX'));
            if (deductionDate) {
                fr.EjercicioDeduccion = deductionDate.year;
                fr.PeriodoDeduccion = deductionDate.month;
            }
        }

        fr.NumRegistroAcuerdoFacturacion = results[row].getValue('custbody_x_sii_num_reg_acuerdofact', null, 'MAX');

        fr.ClaveRegimenEspecialOTrascendencia = results[row].getValue('custrecord_x_l3_2_codigo', 'custbody_x_sii_claveregimenrecibidas', 'MAX');
        if (!!results[row].getValue('custbody_x_sii_claveregimen_ad1_recibi', null, 'MAX')) fr.ClaveRegimenEspecialOTrascendenciaAdicional1 = results[row].getValue('custbody_x_sii_claveregimen_ad1_recibi', null, 'MAX');
        if (!!results[row].getValue('custbody_x_sii_claveregimen_ad2_recibi', null, 'MAX')) fr.ClaveRegimenEspecialOTrascendenciaAdicional1 = results[row].getValue('custbody_x_sii_claveregimen_ad2_recibi', null, 'MAX');
        fr.DescripcionOperacion = limpiarCharXML(results[row].getValue('memomain', null, 'MAX'));
        if (!!results[row].getValue('custrecord_x_l5_codigo', 'custbody_x_sii_tiporectificativa', 'MAX'))
            fr.TipoRectificativa = results[row].getValue('custrecord_x_l5_codigo', 'custbody_x_sii_tiporectificativa', 'MAX');

        if (results[row].getValue('isperson', 'vendor', 'MAX') == 'F') {
            var nombre = results[row].getValue('companyname', 'vendor', 'MAX');
        } else {
            var nombre = [results[row].getValue('lastname', 'vendor', 'MAX'), results[row].getValue('firstname', 'vendor', 'MAX')];
            if (!!results[row].getValue('middlename', 'vendor', 'MAX')) nombre.push(results[row].getValue('middlename', 'vendor', 'MAX'));
            nombre = nombre.join(', ');
        }

        if (results[row].getValue('custrecord_x_sii_iva_aduanas', 'taxitem', 'GROUP') == 'T') {//DUA CABECERA EL EMISOR SERA A LA VEZ EL TITULAR
            rlrf.IDFactura.FechaExpedicionFacturaEmisor = dateFormat(results[row].getValue('custbody_x_sii_fechadua', null, 'MAX')).date();
            rlrf.IDFactura.NumSerieFacturaEmisor = results[row].getValue('custbody_x_sii_dua', null, 'MAX').replace(/\\/g, '');

            fr.Contraparte = getContraparte(slrf.Cabecera.Titular.NombreRazon, slrf.Cabecera.Titular.NIF, '01', null, true);
            rlrf.IDFactura.IDEmisorFactura.NIF = fr.Contraparte.NIF;
            rlrf.IDFactura.IDEmisorFactura.IDOtro = fr.Contraparte.IDOtro;
            fr.TipoFactura = 'F5';
        } else {
            fr.Contraparte = getContraparte(
                nombre,
                results[row].getValue('vatregnumber', 'vendor', 'MAX'),
                results[row].getValue('custentity_x_sii_tipoidentificacioncode', 'vendor', 'MAX'),
                results[row].getValue('custentity_x_sii_paisiso', 'vendor', 'MAX'));
            rlrf.IDFactura.IDEmisorFactura.NIF = fr.Contraparte.NIF;
            rlrf.IDFactura.IDEmisorFactura.IDOtro = fr.Contraparte.IDOtro;
        }

        fr = getDesglose(fr, results, results[row]);

        if (fr.ClaveRegimenEspecialOTrascendencia == '05') { //REAV
            var dir = new DetalleIVAReci();
            dir.TipoImpositivo = '';
            dir.CuotaRepercutida = '';
            dir.BaseImponible = 0;

            fr.ImporteTotal = results[row].getValue('total', null, 'MAX');
            fr.CuotaDeducible = 0;
            fr.DesgloseFactura.InversionSujetoPasivo.DetalleIVA = [];
            fr.DesgloseFactura.DesgloseIVA.DetalleIVAReci.push(base);
        }

        slrf.RegistroLRFacturasRecibidas.push(rlrf);
    }

    return slrf;

    function getDesglose(fr, results, values) {
        var multibook = false;
        fr.CuotaDeducible = 0;

        if (values.getValue('custrecord_x_sii_iva_aduanas', 'taxitem', 'GROUP') == 'T'){//DUA, Procesamos sola la linea de aduanas
            fr.DesgloseFactura.DesgloseIVA.DetalleIVAReci.push(getLineDetails(values));
        }else{
            for (var row in results) {
                if (!values || results[row].getValue('internalid', null, 'GROUP') != values.getValue('internalid', null, 'GROUP')) continue;
                if (values.getValue("custrecord_post_notional_tax_amount", "taxitem", "GROUP") == "T" && values.getValue('custrecord_x_l3_2_codigo', 'custbody_x_sii_claveregimenrecibidas', 'MAX') != "09") { //ISP
                    fr.DesgloseFactura.InversionSujetoPasivo.DetalleIVA.push(getLineDetails(results[row])); //error, solo si ISP
                } else {
                    fr.DesgloseFactura.DesgloseIVA.DetalleIVAReci.push(getLineDetails(results[row]));
                }
            }
        }
        return fr;

        function getLineDetails(values) {
            var dir = new DetalleIVAReci();

            var recargoEquivalenciaMap = {
                "26.20" : [21, 5.20],
                "11.40" : [10, 1.40],
                "4.50" : [4, 0.50]
            };

            var tiposImpositivosRecargo = recargoEquivalenciaMap[parseFloat(values.getValue('rate', 'taxitem', 'GROUP')).toFixed(2)];

            if (!!values && values.getValue('custrecord_x_sii_iva_aduanas', 'taxitem', 'GROUP') != 'T') {
                //COMUN para todas los tipos de factura no DUA
                dir.BaseImponible = +((values.getValue('debitamount', !!multibook ? 'accountingtransaction' : null, 'SUM') || 0) - (values.getValue('creditamount', !!multibook ? 'accountingtransaction' : null, 'SUM') || 0)).toFixed(2);
                dir.TipoRecargoEquivalencia = '';
                dir.CuotaRecargoEquivalencia = '';


                if(tiposImpositivosRecargo){ //Si es algun tipo impositivo de los listados en recargo de equivalencia, solo aplica a transacciones nacionales 21%, 10% y 4%
                    dir.TipoRecargoEquivalencia = parseFloat(tiposImpositivosRecargo[1]).toFixed(2) || 0;
                    dir.CuotaRecargoEquivalencia = (dir.BaseImponible * dir.TipoRecargoEquivalencia / 100).toFixed(2);
                }
                //END COMUN


                if (values.getValue('custrecord_post_notional_tax_amount', 'taxitem', 'GROUP') != 'T' && fr.claveRegimen != '09') {//No ISP, No Adq Intracomunitaria
                    if(tiposImpositivosRecargo){
                        dir.TipoImpositivo = parseInt(tiposImpositivosRecargo[0], 10) || 0;
                        //Sin Multibook
                        dir.CuotaSoportada = (dir.TipoImpositivo * dir.BaseImponible  / 100).toFixed(2);
                    }else{
                        dir.TipoImpositivo = parseInt(values.getValue('rate', 'taxitem', 'GROUP'), 10) || 0;
                        dir.CuotaSoportada = !!multibook ? (dir.TipoImpositivo * dir.BaseImponible / 100).toFixed(2) : (values.getValue('taxamount', null, 'SUM') || 0) * -1;
                    }

                } else {
                    dir.TipoImpositivo = parseInt((values.getValue('custrecord_x_sii_tasaderivada', 'taxitem', 'GROUP') || 0), 10);
                    if (values.getValue('custrecord_post_notional_tax_amount', 'taxitem', 'GROUP') == 'T' && fr.claveRegimen != '09') { //ISP
                        dir.CuotaSoportada = (dir.TipoImpositivo * dir.BaseImponible / 100).toFixed(2);
                    } else {
                        dir.CuotaSoportada = (dir.TipoImpositivo * dir.BaseImponible / 100).toFixed(2);
                    }
                }

                if (values.getValue('custrecord_x_sii_nodeducible', 'taxitem', 'GROUP') != 'T') {
                    if(tiposImpositivosRecargo){//Cuando la CuotaRecargoEquivalencia este cumplimentada, la CuotaDeducible tiene que ser cero
                        fr.CuotaDeducible = 0;
                    }else{
                        fr.CuotaDeducible = +(parseFloat(fr.CuotaDeducible) + parseFloat(dir.CuotaSoportada)).toFixed(2);
                    }
                } else {
                    var porcentajeDeducible = values.getValue('custrecord_x_sii_tax_porc_deducible', 'taxitem', 'GROUP') || 0;
                    if (porcentajeDeducible != 0) {
                        fr.CuotaDeducible = +(parseFloat(fr.CuotaDeducible) + parseFloat(dir.CuotaSoportada) * parseFloat(porcentajeDeducible / 100).toFixed(2)).toFixed(2);
                    }
                }
                //Bienes de inversión tanto para ISP como DesgloseIva
                if (values.getValue('custrecord_x_sii_iva_bienes_inversion', 'taxitem', 'GROUP') == 'T') {
                    dir.BienInversion = 'S';
                }
            }else if (!!values && values.getValue('custrecord_x_sii_iva_aduanas', 'taxitem', 'GROUP') == 'T' && fr.TipoFactura == 'F5'){ //DUA
                //DUA, SE RELLENARA EL IMPORTE CON LA INFORMACION DE LA LINEA DE IMPORTACION
                //SI ES LA FACTURA "HERMANA" DEL TRANSITARIO IGNORARA LA LINEA YA QUE SU TIPO DE FACTURA SERA F1
                //AL TRATARSE DE UNA OPERACION SUJETA NO EXENTA AL 21%, QUE CORRESPONDEN A LOS SERVICIOS DE AGENTE DE ADUANAS
                dir.BaseImponible = +((values.getValue('debitamount', !!multibook ? 'accountingtransaction' : null, 'SUM') || 0) - (values.getValue('creditamount', !!multibook ? 'accountingtransaction' : null, 'SUM') || 0)).toFixed(2);
                dir.TipoImpositivo = parseInt(values.getValue('rate', 'taxitem', 'GROUP'), 10) || 0;
                dir.CuotaSoportada = !!multibook ? (dir.TipoImpositivo * dir.BaseImponible / 100).toFixed(2) : (values.getValue('taxamount', null, 'SUM') || 0) * -1;
                fr.CuotaDeducible = +(parseFloat(fr.CuotaDeducible) + parseFloat(dir.CuotaSoportada)).toFixed(2);
            }

            return dir;
        }
    }

    function hasErrors(row) {
        try {
            if (!row.getValue('custbody_x_sii_fechaemision', null, 'MAX')) {
                throw nlapiCreateError('MISSING_EMIT_DATE', 'NO se ha establecido la fecha de emisión.');
            } else if (!row.getValue('custbody_x_sii_fechacontab', null, 'MAX')) {
                throw nlapiCreateError('MISSING_CONTAB_DATE', 'NO se ha establecido la fecha de contabilización.');
            } else if (row.getValue('custrecord_x_sii_iva_aduanas', 'taxitem', 'GROUP') == 'T') {
                if (!row.getValue('custbody_x_sii_fechadua', null, 'MAX')) {
                    throw nlapiCreateError('MISSING_DUA_DATE', 'NO se ha establecido la fecha de dua para un impuesto sujeto al mismo.');
                } else if (!row.getValue('custbody_x_sii_dua', null, 'MAX')) {
                    throw nlapiCreateError('MISSING_DUA_TRANID', 'NO se ha el numero de serie de factura del emisor de dua para un impuesto sujeto al mismo.');
                }
            }
            return false;
        } catch (e) {
            nlapiLogExecution('ERROR', row.getValue('internalid', null, 'GROUP'), e.code)
            logs.header = 'Error en la generación del fichero de exportación';
            logs.lines[row.getValue('internalid', null, 'GROUP')] = {
                code: e.code,
                details: e.details
            };
            return true;
        }
    }
}

function getCustomerType() {
    //Si el entorno tiene proyectos, para ver la información de los clientes correctemente
    //en las facturas emitidas cambiar los campos de customer/project a customer-mainline
    //Busquedas: customsearch_x_sii_exportfacemi ,customsearch_x_sii_transtoexport_emi
    return !!nlapiGetContext().getFeature('jobs') ? 'customermain' : 'customer';
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}

function limpiarCharXML(original){
    var result = original;

    result = result.replaceAll("º", "o");
    result = result.replaceAll("ª", "a");

    result = result.replaceAll("·", ".");

    result = result.replaceAll("#", "-");

    result = result.replaceAll("&", "&amp;");
    result = result.replaceAll("<", "&lt;");
    result = result.replaceAll(">", "&gt;");
    result = result.replaceAll("\"", "&quot;");
    result = result.replaceAll("'", "&apos;");
    result = result.replaceAll("\n", " ");
    result = result.replaceAll("\r", "");

    return result;
}
//#endregion