/**
 * Clases del documento XML de presentación a la AEAT (SII 2.0)
 * Versión: 0.0.0
 * Fecha: 13/01/2020
 * sii_facturasLib_XML
 */

var default_envelope = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\n' +
    'xmlns:siiLR="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroLR.xsd"\n' +
    'xmlns:sii="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroInformacion.xsd">';

//#region UNICAS FACTURAS EMITIDAS
function SuministroLRFacturasEmitidas(envelope) { //UNICA EMITIDA
    this.Cabecera = new Cabecera();
    this.RegistroLRFacturasEmitidas = [];
    this.SuministroLRFacturasEnvelopeHeader = '<?xml version="1.0" encoding="UTF-8"?>\n' + (envelope || default_envelope) + '\n<soapenv:Header />\n<soapenv:Body>\n';
    this.toXML = function () {
        var result = this.SuministroLRFacturasEnvelopeHeader
        result += "<siiLR:SuministroLRFacturasEmitidas>\n";
        result += this.Cabecera.toXML();
        if (this.RegistroLRFacturasEmitidas.length > 0) {
            for (var i = 0; i < this.RegistroLRFacturasEmitidas.length; i++) {
                result += this.RegistroLRFacturasEmitidas[i].toXML();
            }
        }
        result += "</siiLR:SuministroLRFacturasEmitidas>\n";
        result += '</soapenv:Body>\n</soapenv:Envelope>';
        return result;
    }
}

function RegistroLRFacturasEmitidas() { //UNICA EMITIDA
    this.PeriodoLiquidacion = new PeriodoLiquidacion();
    this.IDFactura = new IDFacturaEmi();
    this.FacturaExpedida = new FacturaExpedida();
    this.toXML = function () {
        var result = "<siiLR:RegistroLRFacturasEmitidas>\n";
        result += this.PeriodoLiquidacion.toXML();
        result += this.IDFactura.toXML();
        result += this.FacturaExpedida.toXML();
        result += "</siiLR:RegistroLRFacturasEmitidas>\n"
        return result;
    }
}

function IDFacturaEmi() { //UNICA EMITIDA
    this.IDEmisorFactura = new IDEmisorFacturaEmi();
    this.NumSerieFacturaEmisor = null;
    this.NumSerieFacturaEmisorResumenFin = null;
    this.FechaExpedicionFacturaEmisor = null;
    this.toXML = function () {
        var result = "<siiLR:IDFactura>\n";
        result += this.IDEmisorFactura.toXML();
        result += "<sii:NumSerieFacturaEmisor>" + this.NumSerieFacturaEmisor + "</sii:NumSerieFacturaEmisor>\n";
        if (!!this.NumSerieFacturaEmisorResumenFin) {
            result += "<sii:NumSerieFacturaEmisorResumenFin>" + this.NumSerieFacturaEmisorResumenFin + "</sii:NumSerieFacturaEmisorResumenFin>\n";
        }
        result += "<sii:FechaExpedicionFacturaEmisor>" + this.FechaExpedicionFacturaEmisor + "</sii:FechaExpedicionFacturaEmisor>\n";
        result += "</siiLR:IDFactura>\n";
        return result;
    }
}

function IDEmisorFacturaEmi() { //UNICA ENITIDA
    this.NIF = null;
    this.toXML = function () {
        var result = "<sii:IDEmisorFactura>\n";
        result += "<sii:NIF>" + this.NIF + "</sii:NIF>\n";
        result += "</sii:IDEmisorFactura>\n";
        return result;
    }
}

function FacturaExpedida() { //UNICA EMITIDA
    this.TipoFactura = null;
    this.TipoRectificativa = null;
    this.FacturasAgrupadas = [];
    this.FacturasRectificadas = [];
    this.ImporteRectificacion = new ImporteRectificacion();
    this.FechaOperacion = null;
    this.ClaveRegimenEspecialOTrascendencia = null;
    this.ClaveRegimenEspecialOTrascendenciaAdicional1 = null;
    this.ClaveRegimenEspecialOTrascendenciaAdicional2 = null;
    this.NumRegistroAcuerdoFacturacion = null;
    this.ImporteTotal = null;
    this.BaseImponibleACoste = null;
    this.DescripcionOperacion = null;
    this.RefExterna = null;
    this.FacturaSimplificadaArticulos72_73 = null;
    this.EntidadSucedida = new EntidadSucedida();
    this.RegPrevioGGEEoREDEMEoCompetencia = null;
    this.Macrodato = null;
    this.DatosInmueble = new DatosInmueble();
    this.ImporteTransmisionInmueblesSujetoAIVA = null;
    this.EmitidaPorTercerosODestinatario = null;
    this.FacturacionDispAdicionalTerceraYSextaYDelMercadoOrganizadoDelGas = null;
    this.VariosDestinatarios = null;
    this.Cupon = null;
    this.FacturaSinIdentifDestinatarioArticulo6_1_d = null;
    this.Contraparte = new Contraparte();
    this.TipoDesglose = new TipoDesglose();
    this.toXML = function () {
        var result = "<siiLR:FacturaExpedida>\n";
        result += "<sii:TipoFactura>" + this.TipoFactura + "</sii:TipoFactura>\n";
        if (!!this.TipoRectificativa) {
            result += "<sii:TipoRectificativa>" + this.TipoRectificativa + "</sii:TipoRectificativa>";
        }
        if (this.FacturasAgrupadas.length > 0) {
            result += "<sii:FacturasAgrupadas>\n";
            for (var i = 0; i < this.FacturasAgrupadas.length; i++) {
                result += this.FacturasAgrupadas[i].toXML();
            }
            result += "</sii:FacturasAgrupadas>\n";
        }
        if (this.FacturasRectificadas.length > 0) {
            result += "<sii:FacturasRectificadas>\n";
            for (var i = 0; i < this.FacturasRectificadas.length; i++) {
                result += this.FacturasRectificadas[i].toXML();
            }
            result += "</sii:FacturasRectificadas>\n";
        }
        if (!!this.ImporteRectificacion.toXML()) {
            result += this.ImporteRectificacion.toXML();
        }
        if (!!this.FechaOperacion) {
            result += "<sii:FechaOperacion>" + this.FechaOperacion + "</sii:FechaOperacion>\n";
        }
        result += "<sii:ClaveRegimenEspecialOTrascendencia>" + this.ClaveRegimenEspecialOTrascendencia + "</sii:ClaveRegimenEspecialOTrascendencia>\n";
        if (!!this.ClaveRegimenEspecialOTrascendenciaAdicional1) {
            result += "<sii:ClaveRegimenEspecialOTrascendenciaAdicional1>" + this.ClaveRegimenEspecialOTrascendenciaAdicional1 + "</sii:ClaveRegimenEspecialOTrascendenciaAdicional1>\n";
        }
        if (!!this.ClaveRegimenEspecialOTrascendenciaAdicional2) {
            result += "<sii:ClaveRegimenEspecialOTrascendenciaAdicional2>" + this.ClaveRegimenEspecialOTrascendenciaAdicional2 + "</sii:ClaveRegimenEspecialOTrascendenciaAdicional2>\n";
        }
        if (!!this.NumRegistroAcuerdoFacturacion) {
            result += "<sii:NumRegistroAcuerdoFacturacion>" + this.NumRegistroAcuerdoFacturacion + "</sii:NumRegistroAcuerdoFacturacion>\n";
        }
        if (!!this.ImporteTotal) {
            result += "<sii:ImporteTotal>" + this.ImporteTotal + "</sii:ImporteTotal>\n";
        }
        if (!!this.BaseImponibleACoste) {
            result += "<sii:BaseImponibleACoste>" + this.BaseImponibleACoste + "</sii:BaseImponibleACoste>\n";
        }
        result += "<sii:DescripcionOperacion>" + this.DescripcionOperacion + "</sii:DescripcionOperacion>\n";
        if (!!this.RefExterna) {
            result += "<sii:RefExterna>" + this.RefExterna + "</sii:RefExterna>\n";
        }
        if (!!this.FacturaSimplificadaArticulos72_73) {
            result += "<sii:FacturaSimplificadaArticulos72_73>" + this.FacturaSimplificadaArticulos72_73 + "</sii:FacturaSimplificadaArticulos72_73>\n";
        }
        if (!!this.EntidadSucedida.toXML()) {
            result += this.EntidadSucedida.toXML();
        }
        if (!!this.RegPrevioGGEEoREDEMEoCompetencia) {
            result += "<sii:RegPrevioGGEEoREDEMEoCompetencia>" + this.RegPrevioGGEEoREDEMEoCompetencia + "</sii:RegPrevioGGEEoREDEMEoCompetencia>\n";
        }
        if (!!this.Macrodato) {
            result += "<sii:Macrodato>" + this.Macrodato + "</sii:Macrodato>\n";
        }
        if (!!this.DatosInmueble.toXML()) {
            result += this.DatosInmueble.toXML();
        }
        if (!!this.ImporteTransmisionInmueblesSujetoAIVA) {
            result += "<sii:ImporteTransmisionInmueblesSujetoAIVA>" + this.ImporteTransmisionInmueblesSujetoAIVA + "</sii:ImporteTransmisionInmueblesSujetoAIVA>\n";
        }
        if (!!this.EmitidaPorTercerosODestinatario) {
            result += "<sii:EmitidaPorTercerosODestinatario>" + this.EmitidaPorTercerosODestinatario + "</sii:EmitidaPorTercerosODestinatario>\n";
        }
        if (!!this.FacturacionDispAdicionalTerceraYSextaYDelMercadoOrganizadoDelGas) {
            result += "<sii:FacturacionDispAdicionalTerceraYSextaYDelMercadoOrganizadoDelGas>" + this.FacturacionDispAdicionalTerceraYSextaYDelMercadoOrganizadoDelGas + "</sii:FacturacionDispAdicionalTerceraYSextaYDelMercadoOrganizadoDelGas>\n";
        }
        if (!!this.VariosDestinatarios) {
            result += "<sii:VariosDestinatarios>" + this.VariosDestinatarios + "</sii:VariosDestinatarios>\n";
        }
        if (!!this.Cupon) {
            result += "<sii:Cupon>" + this.Cupon + "</sii:Cupon>\n";
        }
        if (!!this.FacturaSinIdentifDestinatarioArticulo6_1_d) {
            result += "<sii:FacturaSinIdentifDestinatarioArticulo6.1.d>" + this.Cupon + "</sii:FacturaSinIdentifDestinatarioArticulo6.1.d>\n";
        }
        if (!!this.Contraparte.toXML()) {
            result += this.Contraparte.toXML();
        }
        result += this.TipoDesglose.toXML();
        result += "</siiLR:FacturaExpedida>\n"
        return result;
    }

}

function DatosInmueble() { //UNICA EMITIDA
    this.DetalleInmueble = [];
    this.toXML = function () {
        if (!!this.DetalleInmueble.length > 0) {
            var result = "<sii:DatosInmueble>\n";
            for (var i = 0; i < this.DetalleInmueble.length; i++) {
                result += this.DetalleInmueble[i].toXML();
            }
            result += "</sii:DatosInmueble>\n";
            return result;
        } else {
            return "";
        }
    }
}

function DetalleInmueble() { //UNICA EMITIDA
    this.SituacionInmueble = null;
    this.ReferenciaCatastral = null;
    this.toXML = function () {
        if (!!this.SituacionInmueble) {
            var result = "<sii:DetalleInmueble>\n";
            result += "<sii:SituacionInmueble>" + this.SituacionInmueble + "</sii:SituacionInmueble>\n";
            if (!!this.ReferenciaCatastral) {
                result += "<sii:ReferenciaCatastral>" + this.ReferenciaCatastral + "</sii:ReferenciaCatastral>\n";
            }
            result += "</sii:DetalleInmueble>\n";
            return result;
        } else {
            return "";
        }
    }
}

function TipoDesglose() { //UNICA EMITIDA
    this.DesgloseFactura = new DesgloseFacturaEmi();
    this.DesgloseTipoOperacion = new DesgloseTipoOperacion();
    this.toXML = function () {
        var result = "<sii:TipoDesglose>\n";
        if (!!this.DesgloseFactura.toXML()) {
            result += this.DesgloseFactura.toXML();
        } else {
            result += this.DesgloseTipoOperacion.toXML();
        }
        result += "</sii:TipoDesglose>\n";
        return result;
    }
}

function DesgloseFacturaEmi() { //UNICA EMITIDA
    this.Sujeta = new Sujeta();
    this.NoSujeta = new NoSujeta();
    this.toXML = function () {
        if (!!this.Sujeta.toXML() || !!this.NoSujeta.toXML()) {
            var result = "<sii:DesgloseFactura>\n";
            if (!!this.Sujeta.toXML()) {
                result += this.Sujeta.toXML();
            }
            if (!!this.NoSujeta.toXML()) {
                result += this.NoSujeta.toXML();
            }
            result += "</sii:DesgloseFactura>\n";
            return result;
        } else {
            return "";
        }
    }
}

function Sujeta() { //UNICA EMITIDA
    this.Exenta = new Exenta();
    this.NoExenta = new NoExenta();
    this.toXML = function () {
        if (!!this.Exenta.toXML() || !!this.NoExenta.toXML()) {
            var result = "<sii:Sujeta>\n";
            if (!!this.Exenta.toXML()) {
                result += this.Exenta.toXML();
            }
            if (!!this.NoExenta.toXML()) {
                result += this.NoExenta.toXML();
            }
            result += "</sii:Sujeta>\n";
            return result;
        } else {
            return "";
        }

    }
}

function Exenta() { //UNICA EMITIDA
    this.DetalleExenta = [];
    this.toXML = function () {
        if (this.DetalleExenta.length > 0) {
            var result = "<sii:Exenta>\n";
            for (var i = 0; i < this.DetalleExenta.length; i++) {
                result += this.DetalleExenta[i].toXML();
            }
            result += "</sii:Exenta>\n";
            return result;
        }
    }
}

function DetalleExenta() { //UNICA EMITIDA
    this.CausaExencion = null;
    this.BaseImponible = null;
    this.toXML = function () {
        if (!!this.BaseImponible) {
            var result = "<sii:DetalleExenta>\n";
            if (!!this.CausaExencion) {
                result += "<sii:CausaExencion>" + this.CausaExencion + "</sii:CausaExencion>\n";
            }
            result += "<sii:BaseImponible>" + this.BaseImponible + "</sii:BaseImponible>\n";
            result += "</sii:DetalleExenta>\n";
            return result;
        } else {
            return "";
        }
    }
}

function NoExenta() { //UNICA EMITIDA
    this.TipoNoExenta = null;
    this.DesgloseIVA = new DesgloseIVA();
    this.toXML = function () {
        if (!!this.TipoNoExenta) {
            var result = "<sii:NoExenta>\n";
            result += "<sii:TipoNoExenta>" + this.TipoNoExenta + "</sii:TipoNoExenta>\n";
            result += this.DesgloseIVA.toXML();
            result += "</sii:NoExenta>\n";
            return result;
        } else {
            return "";
        }

    }
}

function DetalleIVAEmi() { //UNICA EMITIDA
    this.TipoImpositivo = null;
    this.BaseImponible = null;
    this.CuotaRepercutida = null;
    this.TipoRecargoEquivalencia = null;
    this.CuotaRecargoEquivalencia = null;
    this.toXML = function () {
        if (!!this.BaseImponible) {
            var result = "<sii:DetalleIVA>\n";
            if (this.TipoImpositivo != null || this.TipoImpositivo != '') {
                result += "<sii:TipoImpositivo>" + this.TipoImpositivo + "</sii:TipoImpositivo>\n";
            }
            result += "<sii:BaseImponible>" + this.BaseImponible + "</sii:BaseImponible>\n";
            if (!!this.CuotaRepercutida) {
                result += "<sii:CuotaRepercutida>" + this.CuotaRepercutida + "</sii:CuotaRepercutida>\n";
            }
            if (!!this.TipoRecargoEquivalencia) {
                result += "<sii:TipoRecargoEquivalencia>" + this.TipoRecargoEquivalencia + "</sii:TipoRecargoEquivalencia>\n";
            }
            if (!!this.CuotaRecargoEquivalencia) {
                result += "<sii:CuotaRecargoEquivalencia>" + this.CuotaRecargoEquivalencia + "</sii:CuotaRecargoEquivalencia>\n";
            }
            result += "</sii:DetalleIVA>\n";
            return result;
        } else {
            return "";
        }
    }
}

function NoSujeta() { //UNICA EMITIDA
    this.ImportePorArticulos7_14_Otros = null;
    this.ImporteTAIReglasLocalizacion = null;
    this.toXML = function () {
        if (!!this.ImportePorArticulos7_14_Otros || !!this.ImporteTAIReglasLocalizacion) {
            var result = "<sii:NoSujeta>\n";
            if (!!this.ImportePorArticulos7_14_Otros) {
                result += "<sii:ImportePorArticulos7_14_Otros>" + this.ImportePorArticulos7_14_Otros + "</sii:ImportePorArticulos7_14_Otros>\n";
            }
            if (!!this.ImporteTAIReglasLocalizacion) {
                result += "<sii:ImporteTAIReglasLocalizacion>" + this.ImporteTAIReglasLocalizacion + "</sii:ImporteTAIReglasLocalizacion>\n";
            }
            result += "</sii:NoSujeta>"
            return result;
        } else {
            return "";
        }
    }
}

function DesgloseTipoOperacion() { //UNICA EMITIDA
    this.PresentacionServicios = new PresentacionServicios();
    this.Entrega = new Entrega();
    this.toXML = function () {
        if (!!this.PresentacionServicios.toXML() || !!this.Entrega.toXML()) {
            var result = "<sii:DesgloseTipoOperacion>\n";
            if (!!this.PresentacionServicios.toXML()) {
                result += this.PresentacionServicios.toXML();
            }
            if (!!this.Entrega.toXML()) {
                result += this.Entrega.toXML();
            }
            result += "</sii:DesgloseTipoOperacion>\n";
            return result;
        } else {
            return "";
        }
    }
}

function PresentacionServicios() { //UNICA EMITIDA
    this.Sujeta = new Sujeta();
    this.NoSujeta = new NoSujeta();
    this.toXML = function () {
        if (!!this.Sujeta.toXML() || !!this.NoSujeta.toXML()) {
            var result = "<sii:PrestacionServicios>\n";
            if (!!this.Sujeta.toXML()) {
                result += this.Sujeta.toXML();
            }
            if (!!this.NoSujeta.toXML()) {
                result += this.NoSujeta.toXML();
            }
            result += "</sii:PrestacionServicios>\n";
            return result;
        } else {
            return "";
        }
    }
}

function Entrega() { //UNICA EMITIDA
    this.Sujeta = new Sujeta();
    this.NoSujeta = new NoSujeta();
    this.toXML = function () {
        if (!!this.Sujeta.toXML() || !!this.NoSujeta.toXML()) {
            var result = "<sii:Entrega>\n";
            if (!!this.Sujeta.toXML()) {
                result += this.Sujeta.toXML();
            }
            if (!!this.NoSujeta.toXML()) {
                result += this.NoSujeta.toXML();
            }
            result += "</sii:Entrega>\n";
            return result;
        } else {
            return "";
        }
    }
}
//#endregion

//#region UNICAS FACTURAS RECIBIDAS
function SuministroLRFacturasRecibidas(envelope) { //UNICA RECIBIDA
    this.Cabecera = new Cabecera();
    this.RegistroLRFacturasRecibidas = [];
    this.SuministroLRFacturasEnvelopeHeader = '<?xml version="1.0" encoding="UTF-8"?>\n' + (envelope || default_envelope) + '\n<soapenv:Header />\n<soapenv:Body>\n';
    this.toXML = function () {
        var result = this.SuministroLRFacturasEnvelopeHeader;
        result += "<siiLR:SuministroLRFacturasRecibidas>\n";
        result += this.Cabecera.toXML();
        if (this.RegistroLRFacturasRecibidas.length > 0) {
            for (var i = 0; i < this.RegistroLRFacturasRecibidas.length; i++) {
                result += this.RegistroLRFacturasRecibidas[i].toXML();
            }
        }
        result += "</siiLR:SuministroLRFacturasRecibidas>";
        result += '</soapenv:Body>\n</soapenv:Envelope>';
        return result;
    }
}

function RegistroLRFacturasRecibidas() { //UNICA RECIBIDA
    this.PeriodoLiquidacion = new PeriodoLiquidacion();
    this.IDFactura = new IDFacturaReci();
    this.FacturaRecibida = new FacturaRecibida();
    this.toXML = function () {
        var result = "<siiLR:RegistroLRFacturasRecibidas>\n";
        result += this.PeriodoLiquidacion.toXML();
        result += this.IDFactura.toXML();
        result += this.FacturaRecibida.toXML();
        result += "</siiLR:RegistroLRFacturasRecibidas>\n"
        return result;
    }
}

function IDFacturaReci() { //UNICA RECIBIDA
    this.IDEmisorFactura = new IDEmisorFacturaReci();
    this.NumSerieFacturaEmisor = null;
    this.NumSerieFacturaEmisorResumenFin = null;
    this.FechaExpedicionFacturaEmisor = null;
    this.toXML = function () {
        var result = "<siiLR:IDFactura>\n";
        result += this.IDEmisorFactura.toXML();
        result += "<sii:NumSerieFacturaEmisor>" + this.NumSerieFacturaEmisor + "</sii:NumSerieFacturaEmisor>\n";
        if (!!this.NumSerieFacturaEmisorResumenFin) {
            result += "<sii:NumSerieFacturaEmisorResumenFin>" + this.NumSerieFacturaEmisorResumenFin + "</sii:NumSerieFacturaEmisorResumenFin>\n";
        }
        result += "<sii:FechaExpedicionFacturaEmisor>" + this.FechaExpedicionFacturaEmisor + "</sii:FechaExpedicionFacturaEmisor>\n";
        result += "</siiLR:IDFactura>\n";
        return result;

    }
}

function IDEmisorFacturaReci() { //UNICA RECIBIDA
    this.NIF = null;
    this.IDOtro = new IDOtro();
    this.toXML = function () {
        var result = "<sii:IDEmisorFactura>\n";
        if (!!this.NIF) {
            result += "<sii:NIF>" + this.NIF + "</sii:NIF>\n";
        } else {
            result += this.IDOtro.toXML();
        }
        result += "</sii:IDEmisorFactura>\n";
        return result;
    }
}

function FacturaRecibida() { //UNICA RECIBIDA
    this.TipoFactura = null;
    this.TipoRectificativa = null;
    this.FacturasAgrupadas = [];
    this.FacturasRectificadas = [];
    this.ImporteRectificacion = new ImporteRectificacion();
    this.FechaOperacion = null;
    this.ClaveRegimenEspecialOTrascendencia = null;
    this.ClaveRegimenEspecialOTrascendenciaAdicional1 = null;
    this.ClaveRegimenEspecialOTrascendenciaAdicional2 = null;
    this.NumRegistroAcuerdoFacturacion = null;
    this.ImporteTotal = null;
    this.BaseImponibleACoste = null;
    this.DescripcionOperacion = null;
    this.RefExterna = null;
    this.FacturaSimplificadaArticulos72_73 = null;
    this.EntidadSucedida = new EntidadSucedida();
    this.RegPrevioGGEEoREDEMEoCompetencia = null;
    this.Macrodato = null;
    this.DesgloseFactura = new DesgloseFacturaReci();
    this.Contraparte = new Contraparte();
    this.FechaRegContable = null;
    this.CuotaDeducible = null;
    this.ADeducirEnPeriodoPosterior = null;
    this.EjercicioDeduccion = null;
    this.PeriodoDeduccion = null;

    this.toXML = function () {
        var result = "<siiLR:FacturaRecibida>\n";
        result += "<sii:TipoFactura>" + this.TipoFactura + "</sii:TipoFactura>\n";
        if (!!this.TipoRectificativa) {
            result += "<sii:TipoRectificativa>" + this.TipoRectificativa + "</sii:TipoRectificativa>";
        }
        if (this.FacturasAgrupadas.length > 0) {
            result += "<sii:FacturasAgrupadas>\n";
            for (var i = 0; i < this.FacturasAgrupadas.length; i++) {
                result += this.FacturasAgrupadas[i].toXML();
            }
            result += "</sii:FacturasAgrupadas>\n";
        }
        if (this.FacturasRectificadas.length > 0) {
            result += "<sii:FacturasRectificadas>\n";
            for (var i = 0; i < this.FacturasRectificadas.length; i++) {
                result += this.FacturasRectificadas[i].toXML();
            }
            result += "</sii:FacturasRectificadas>\n";
        }
        if (!!this.ImporteRectificacion.toXML()) {
            result += this.ImporteRectificacion.toXML();
        }
        if (!!this.FechaOperacion) {
            result += "<sii:FechaOperacion>" + this.FechaOperacion + "</sii:FechaOperacion>\n";
        }
        result += "<sii:ClaveRegimenEspecialOTrascendencia>" + this.ClaveRegimenEspecialOTrascendencia + "</sii:ClaveRegimenEspecialOTrascendencia>\n";
        if (!!this.ClaveRegimenEspecialOTrascendenciaAdicional1) {
            result += "<sii:ClaveRegimenEspecialOTrascendenciaAdicional1>" + this.ClaveRegimenEspecialOTrascendenciaAdicional1 + "</sii:ClaveRegimenEspecialOTrascendenciaAdicional1>\n";
        }
        if (!!this.ClaveRegimenEspecialOTrascendenciaAdicional2) {
            result += "<sii:ClaveRegimenEspecialOTrascendenciaAdicional2>" + this.ClaveRegimenEspecialOTrascendenciaAdicional2 + "</sii:ClaveRegimenEspecialOTrascendenciaAdicional2>\n";
        }
        if (!!this.NumRegistroAcuerdoFacturacion) {
            result += "<sii:NumRegistroAcuerdoFacturacion>" + this.NumRegistroAcuerdoFacturacion + "</sii:NumRegistroAcuerdoFacturacion>\n";
        }
        if (!!this.ImporteTotal) {
            result += "<sii:ImporteTotal>" + this.ImporteTotal + "</sii:ImporteTotal>\n";
        }
        if (!!this.BaseImponibleACoste) {
            result += "<sii:BaseImponibleACoste>" + this.BaseImponibleACoste + "</sii:BaseImponibleACoste>\n";
        }
        result += "<sii:DescripcionOperacion>" + this.DescripcionOperacion + "</sii:DescripcionOperacion>\n";
        if (!!this.RefExterna) {
            result += "<sii:RefExterna>" + this.RefExterna + "</sii:RefExterna>\n";
        }
        if (!!this.FacturaSimplificadaArticulos72_73) {
            result += "<sii:FacturaSimplificadaArticulos72_73>" + this.FacturaSimplificadaArticulos72_73 + "</sii:FacturaSimplificadaArticulos72_73>\n";
        }
        if (!!this.EntidadSucedida.toXML()) {
            result += this.EntidadSucedida.toXML();
        }
        if (!!this.RegPrevioGGEEoREDEMEoCompetencia) {
            result += "<sii:RegPrevioGGEEoREDEMEoCompetencia>" + this.RegPrevioGGEEoREDEMEoCompetencia + "</sii:RegPrevioGGEEoREDEMEoCompetencia>\n";
        }
        if (!!this.Macrodato) {
            result += "<sii:Macrodato>" + this.Macrodato + "</sii:Macrodato>\n";
        }
        if (!!this.DesgloseFactura.toXML()) {
            result += this.DesgloseFactura.toXML();
        }
        if (!!this.Contraparte.toXML()) {
            result += this.Contraparte.toXML();
        }
        result += "<sii:FechaRegContable>" + this.FechaRegContable + "</sii:FechaRegContable>";
        result += "<sii:CuotaDeducible>" + this.CuotaDeducible + "</sii:CuotaDeducible>";
        if (!!this.ADeducirEnPeriodoPosterior) {
            result += "<sii:ADeducirEnPeriodoPosterior>" + this.ADeducirEnPeriodoPosterior + "</sii:ADeducirEnPeriodoPosterior>\n";
        }
        if (!!this.EjercicioDeduccion) {
            result += "<sii:EjercicioDeduccion>" + this.EjercicioDeduccion + "</sii:EjercicioDeduccion>\n";
        }
        if (!!this.PeriodoDeduccion) {
            result += "<sii:PeriodoDeduccion>" + this.PeriodoDeduccion + "</sii:PeriodoDeduccion>\n";
        }
        result += "</siiLR:FacturaRecibida>\n";
        return result;
    }
}

function DesgloseFacturaReci() { //UNICA RECIBIDA
    this.InversionSujetoPasivo = new InversionSujetoPasivo();
    this.DesgloseIVA = new DesgloseIVA();
    this.toXML = function () {
        if (!!this.InversionSujetoPasivo.toXML() || !!this.DesgloseIVA.toXML()) {
            var result = "<sii:DesgloseFactura>\n";
            if (!!this.InversionSujetoPasivo) {
                result += this.InversionSujetoPasivo.toXML();
            }
            if (!!this.DesgloseIVA.toXML()) {
                result += this.DesgloseIVA.toXML();
            }
            result += "</sii:DesgloseFactura>";
            return result;
        } else {
            return "";
        }
    }
}

function InversionSujetoPasivo() { //UNICA RECIBIDA
    this.DetalleIVA = [];
    this.toXML = function () {
        if (!!this.DetalleIVA.length > 0) {
            var result = "<sii:InversionSujetoPasivo>\n";
            for (var i = 0; i < this.DetalleIVA.length; i++) {
                result += this.DetalleIVA[i].toXML();
            }
            result += "</sii:InversionSujetoPasivo>\n";
            return result;
        } else {
            return "";
        }
    }
}

function DetalleIVAReci() { //UNICA RECIBIDA
    this.TipoImpositivo = null;
    this.BaseImponible = null;
    this.CuotaSoportada = null;
    this.TipoRecargoEquivalencia = null;
    this.CuotaRecargoEquivalencia = null;
    this.PorcentCompensacionREAGYP = null;
    this.ImporteCompensacionREAGYP = null;
    this.BienInversion = null;

    this.toXML = function () {
        if (this.BaseImponible == 0 || !!this.BaseImponible) {
            var result = "<sii:DetalleIVA>\n";
            if (this.TipoImpositivo != null || this.TipoImpositivo != '') {
                result += "<sii:TipoImpositivo>" + this.TipoImpositivo + "</sii:TipoImpositivo>\n";
            }
            result += "<sii:BaseImponible>" + this.BaseImponible + "</sii:BaseImponible>\n";
            if (this.CuotaSoportada == 0 || !!this.CuotaSoportada) {
                result += "<sii:CuotaSoportada>" + this.CuotaSoportada + "</sii:CuotaSoportada>\n";
            }
            if (!!this.TipoRecargoEquivalencia) {
                result += "<sii:TipoRecargoEquivalencia>" + this.TipoRecargoEquivalencia + "</sii:TipoRecargoEquivalencia>\n";
            }
            if (!!this.CuotaRecargoEquivalencia) {
                result += "<sii:CuotaRecargoEquivalencia>" + this.CuotaRecargoEquivalencia + "</sii:CuotaRecargoEquivalencia>\n";
            }
            if (!!this.PorcentCompensacionREAGYP) {
                result += "<sii:PorcentCompensacionREAGYP>" + this.PorcentCompensacionREAGYP + "</sii:PorcentCompensacionREAGYP>\n";
            }
            if (!!this.ImporteCompensacionREAGYP) {
                result += "<sii:ImporteCompensacionREAGYP>" + this.ImporteCompensacionREAGYP + "</sii:ImporteCompensacionREAGYP>\n";
            }
            if (!!this.BienInversion) {
                result += "<sii:BienInversion>" + this.BienInversion + "</sii:BienInversion>\n";
            }
            result += "</sii:DetalleIVA>\n";
            return result;
        } else {
            return "";
        }
    }
}

//#endregion RECIBIDAS

//#region COMUNES
function Cabecera() { //COMUN
    this.IDVersionSii = null;
    this.Titular = new Titular();
    this.TipoComunicacion = null;
    this.toXML = function () {
        var result = "<sii:Cabecera>\n";
        result += "<sii:IDVersionSii>" + this.IDVersionSii + "</sii:IDVersionSii>\n";
        result += this.Titular.toXML();
        result += "<sii:TipoComunicacion>" + this.TipoComunicacion + "</sii:TipoComunicacion>\n";
        result += "</sii:Cabecera>\n";
        return result;
    }
}

function Titular() { //COMUN
    this.NombreRazon = null;
    this.NIFRepresentante = null;
    this.NIF = null;
    this.toXML = function () {
        var result = "<sii:Titular>\n";
        result += "<sii:NombreRazon>" + this.NombreRazon + "</sii:NombreRazon>\n";
        if (!!this.NIFRepresentante) {
            result += "<sii:NIFRepresentante>" + this.NIFRepresentante + "</sii:NIFRepresentante>\n";
        }
        result += "<sii:NIF>" + this.NIF + "</sii:NIF>\n";
        result += "</sii:Titular>\n";
        return result;
    }
}

function PeriodoLiquidacion() { //COMUN
    this.Ejercicio = null;
    this.Periodo = null;
    this.toXML = function () {
        var result = "<sii:PeriodoLiquidacion>\n";
        result += "<sii:Ejercicio>" + this.Ejercicio + "</sii:Ejercicio>\n";
        result += "<sii:Periodo>" + this.Periodo + "</sii:Periodo>\n";
        result += "</sii:PeriodoLiquidacion>\n";
        return result;
    }
}

function IDFacturaAgrupada() { //COMUN
    this.NumSerieFacturaEmisor = null;
    this.FechaExpedicionFacturaEmisor = null;
    this.toXML = function () {
        var result = "<sii:IDFacturaAgrupada>\n";
        result += "<sii:NumSerieFacturaEmisor>" + this.NumSerieFacturaEmisor + "</sii:NumSerieFacturaEmisor>\n";
        result += "<sii:FechaExpedicionFacturaEmisor>" + this.FechaExpedicionFacturaEmisor + "</sii:FechaExpedicionFacturaEmisor>\n";
        result += "</sii:IDFacturaAgrupada>\n";
        return result;
    }
}

function FacturaRectificada() { //COMUN
    this.IDFacturaRectificada = new IDFacturaRectificada();
    this.toXML = function () {
        var result = "<sii:FacturaRectificada>\n";
        result += this.IDFacturaRectificada.toXML();
        result += "</sii:FacturaRectificada>\n";
        return result;
    }
}

function IDFacturaRectificada() { //COMUN
    this.NumSerieFacturaEmisor = null;
    this.FechaExpedicionFacturaEmisor = null;
    this.toXML = function () {
        var result = "<sii:IDFacturaRectificada>\n";
        result += "<sii:NumSerieFacturaEmisor>" + this.NumSerieFacturaEmisor + "</sii:NumSerieFacturaEmisor>\n";
        result += "<sii:FechaExpedicionFacturaEmisor>" + this.FechaExpedicionFacturaEmisor + "</sii:FechaExpedicionFacturaEmisor>\n";
        result += "</sii:IDFacturaRectificada>\n";
        return result;

    }
}

function ImporteRectificacion() { //COMUN
    this.BaseRectificada = null;
    this.CuotaRectificada = null;
    this.CuotaRecargoRectificado = null;
    this.toXML = function () {
        if (!!this.BaseRectificada) {
            var result = "<sii:ImporteRectificacion>\n";
            result += "<sii:BaseRectificada>" + this.BaseRectificada + "</sii:BaseRectificada>\n";
            result += "<sii:CuotaRectificada>" + this.CuotaRectificada + "</sii:CuotaRectificada>\n";
            if (!!this.CuotaRecargoRectificado) {
                result += "<sii:CuotaRecargoRectificado>" + this.CuotaRecargoRectificado + "</sii:CuotaRecargoRectificado>\n";
            }
            result += "</sii:ImporteRectificacion>\n";
            return result;
        } else {
            return "";
        }
    }

}


function EntidadSucedida() { //COMUN
    this.NombreRazon = null;
    this.NIF = null;
    this.toXML = function () {
        if (!!this.NombreRazon) {
            var result = "<sii:EntidadSucedida>\n";
            result += "<sii:NombreRazon>" + this.NombreRazon + "</sii:NombreRazon>\n";
            result += "<sii:NIF>" + this.NIF + "</sii:NIF>\n";
            result += "</sii:EntidadSucedida>\n"
            return result;
        } else {
            return "";
        }
    }
}


function Contraparte() { //COMUN
    this.NombreRazon = null;
    this.NIFRepresentante = null;
    this.NIF = null;
    this.IDOtro = new IDOtro();
    this.toXML = function () {
        if (!!this.NombreRazon) {
            var result = "<sii:Contraparte>\n";
            result += "<sii:NombreRazon>" + this.NombreRazon + "</sii:NombreRazon>\n";
            if (!!this.NIFRepresentante) {
                result += "<sii:NIFRepresentante>" + this.NIFRepresentante + "</sii:NIFRepresentante>";
            }
            if (!!this.NIF) {
                result += "<sii:NIF>" + this.NIF + "</sii:NIF>\n";
            } else {
                result += this.IDOtro.toXML();
            }
            result += "</sii:Contraparte>\n";
            return result;
        } else {
            return "";
        }
    }
}

function IDOtro() { //COMUN
    this.CodigoPais = null;
    this.IDType = null;
    this.ID = null;
    this.toXML = function () {
        if (!!this.ID) {
            var result = "<sii:IDOtro>\n";
            if (!!this.CodigoPais) {
                result += "<sii:CodigoPais>" + this.CodigoPais + "</sii:CodigoPais>\n";
            }
            result += "<sii:IDType>" + this.IDType + "</sii:IDType>\n";
            result += "<sii:ID>" + this.ID + "</sii:ID>\n";
            result += "</sii:IDOtro>\n";
            return result;
        } else {
            return "";
        }
    }
}


function DesgloseIVA() { //COMUN
    this.DetalleIVAReci = [];
    this.DetalleIVAEmi = [];
    this.toXML = function () {
        if (this.DetalleIVAEmi.length > 0) {
            var result = "<sii:DesgloseIVA>\n";
            for (var i = 0; i < this.DetalleIVAEmi.length; i++) {
                result += this.DetalleIVAEmi[i].toXML();
            }
            result += "</sii:DesgloseIVA>\n";
            return result;
        } else {
            if (this.DetalleIVAReci.length > 0) {
                var result = "<sii:DesgloseIVA>\n";
                for (var i = 0; i < this.DetalleIVAReci.length; i++) {
                    result += this.DetalleIVAReci[i].toXML();
                }
                result += "</sii:DesgloseIVA>\n";
                return result;
            } else {
                return "";
            }
        }

    }
}
//#endregion COMUNES