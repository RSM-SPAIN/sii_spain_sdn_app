/**
 * Reporte de exportaciones SII 2.0
 * Versión: 0.0.0
 * Fecha: 13/01/2020
 */

//#region REPORT AGIN
function siiExportReport(request, response) {
    var report = nlapiCreateReportDefinition();
    report.addRowHierarchy('subsidiary', 'Compañía', 'TEXT');
    report.addRowHierarchy('type', 'Tipo presentación', 'TEXT');
    report.addRowHierarchy('export', 'Exportación', 'TEXT');
    report.addColumn('created', true, 'Fecha creación', null, 'DATE', null);
    report.addColumn('transaction', true, 'Transaction', null, 'TEXT', null);
    report.addColumn('status', true, 'Estado', null, 'TEXT', null);
    report.addColumn('error', true, 'Descripción de error', null, 'TEXT', null);

    var filters = [];
    filters.push(new nlobjSearchFilter('custrecord_x_le_exportacion', null, 'noneof', '@NONE@'));
    filters.push(new nlobjSearchFilter('custrecord_x_le_transaccion', null, 'noneof', '@NONE@'));
    filters.push(new nlobjSearchFilter('isinactive', 'custrecord_x_le_exportacion', 'is', 'F'));

    var columns = [];
    columns.push(new nlobjSearchColumn('custrecord_x_sii_subsidiary', 'custrecord_x_le_exportacion', 'group'));
    columns.push(new nlobjSearchColumn('custrecord_x_sii_tipopresentacion', 'custrecord_x_le_exportacion', 'group'));
    columns.push(new nlobjSearchColumn('name', 'custrecord_x_le_exportacion', 'group'));
    columns.push(new nlobjSearchColumn('custrecord_x_le_transaccion', null, 'max'));
    columns.push(new nlobjSearchColumn('created', null, 'max'));
    columns.push(new nlobjSearchColumn('custrecord_x_le_estadofactura', null, 'max'));
    columns.push(new nlobjSearchColumn('custrecord_x_le_descripcionerrorregistr', null, 'max'));
    columns.push(new nlobjSearchColumn('created', 'custrecord_x_le_exportacion', 'max').setSort(true));

    var index = 0;
    report.addSearchDataSource(
        'customrecord_x_sii_lineasexportaciones', null, filters, columns,
        {
            'subsidiary': columns[index++],
            'type': columns[index++],
            'export': columns[index++],
            'transaction': columns[index++],
            'created': columns[index++],
            'status': columns[index++],
            'error': columns[index++]
        }
    );

    var form = nlapiCreateReportForm('Report de Exportaciones SII');
    report.executeReport(form);

    response.writePage(form);
}
//#endregion