var rsmLib = function() {
	return {
        setHash: function(input) {
            return (input || '').toString().toLowerCase().trim().replace(/(à|á|â|ä)/g, 'a').replace(/(è|é|ê|ë)/g, 'e').replace(/(ì|í|î|ï)/g, 'i')
            .replace(/(ò|ó|ô|ö)/g, 'o').replace(/(ù|ú|ü|û)/g, 'u').replace(/[^1-9A-Za-z]/g, '');
        },
		createAnnouncer: function(id, message, details, type) {
            if (!type) { type = 'warning'; }
            if (message) {
                var html = '<div id="' + id + '" class="uir-alert-box ' + type + '" width="undefined" role="status" style="">' +
                '<div class="icon ' + type + '"></div><div class="content"><div class="title">' + message + '</div><hr/>' + 
				details + '</div></div>';
            } else {
                var html = '<div id="' + id + '" class="uir-alert-box ' + type + '" width="undefined" role="status" style="">' +
                '<div class="icon ' + type + '"></div><div class="content">' + details + '</div></div>';
            }

            var caDiv = document.getElementById( 'div_cus_alert_' + id);
            if (!caDiv) {
                caDiv = document.createElement("div");
                caDiv.id = 'div_cus_alert_' + id;
            }

            caDiv.innerHTML = html;
            var aDiv = document.getElementById('div__alert');
            if (!aDiv) {
                document.getElementById('div__title').parentElement.insertBefore(caDiv, document.getElementById('div__title'));
            } else {
                aDiv.parentElement.insertBefore(caDiv, aDiv);
            }

            window.pageinitstart = this;
        },
		destroyAnnouncer: function(id) {
            var parent = document.getElementById('div_cus_alert_' + id);
            var child = document.getElementById(id);
            if (!!parent && !!child) {
                parent.removeChild(child);
            }
        },
		checkIBAN: function(input) {
			var CODE_LENGTHS = {
                AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
                CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
                FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
                HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
                LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
                MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
                RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
            };

            var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''),
                code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/),
                digits;

            if(!code || iban.length !== CODE_LENGTHS[code[1]]) {
              return false;
            }

            digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
              return letter.charCodeAt(0) - 55;
            });

            return mod97(digits) === 1;

            function mod97(string) {
                var checksum = string.slice(0, 2),
                    fragment;

                for(var offset = 2 ; offset < string.length ; offset += 7) {
                  fragment = String(checksum) + string.substring(offset, offset + 7);
                  checksum = parseInt(fragment, 10) % 97;
                }

                return checksum;
            }
        },
        checkBIC: function(input) {
            return new RegExp('[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}').test(input);
        },
		checkDNI: function(input) {
            var num, chVat, ch;
            var regEx = /^[XYZ]?\d{5,8}[A-Z]$/;

            if (!input) { return false; }
            input = input.toUpperCase();

            if (!!regEx.test(input)) {
                num = input.substr(0, input.length-1);
                chVat = input.substr(input.length-1, 1);
                num = num.replace('X', 0).replace('Y', 1).replace('Z', 2) % 23;
                ch = 'TRWAGMYFPDXBNJZSQVHLCKET';
                ch = ch.substring(num, num+1);
                return ch != chVat ? false : true;
            } else {
                return false;
            }
        },
		checkCIF: function(input) {
            if (!input || input.length !== 9) {
                return false;
            }

            var letters = ['J', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
            var digits = input.substr(1, input.length - 2);
            var letter = input.substr(0, 1);
            var control = input.substr(input.length - 1);
            var sum = 0;
            var i;
            var digit;

            if (!letter.match(/[A-Z]/)) {
                return false;
            }

            for (i = 0; i < digits.length; ++i) {
                digit = parseInt(digits[i]);

                if (isNaN(digit)) {
                    return false;
                }

                if (i % 2 === 0) {
                    digit *= 2;
                    if (digit > 9) {
                        digit = parseInt(digit / 10) + (digit % 10);
                    }

                    sum += digit;
                } else {
                    sum += digit;
                }
            }

            sum %= 10;
            if (sum !== 0) {
                digit = 10 - sum;
            } else {
                digit = sum;
            }

            if (letter.match(/[ABEH]/)) {
                return String(digit) === control;
            }
            if (letter.match(/[NPQRSW]/)) {
                return letters[digit] === control;
            }

            if (String(digit) === control || letters[digit] === control){
                return true;
            } else {
                return false;
            }
        },
		currFormat: function(input) {
			return !!input ? input.toString().replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : null;
        },
        isEmpty: function(input) {
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            if (!input) return true;
            if (input instanceof Array && input.length === 0)  return true;
            for (var key in input) {
                if (hasOwnProperty.call(input, key)) return false;
            }
        
            return true;
        },
        isNumeric: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        hourToNumber: function(input) {
            var regex = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3])((:[0-5][0-9])|([\.,][0-9][0-9]?))?$');
            var chk = false;
            var o = {num: 0,hour: '0:00'};
        
            if (!regex.test(input)) {
                return null;
            } else {
                if (input.indexOf(':') >= 0) {
                    o.hour = input;
                    input = input.split(':');
                } else {
                    o.num = input.indexOf(',') >= 0 ? +(input.replace(',', '.')).toFixed(2) : input;
                    input = input.toString().split('.');
                    chk = true;
                }

                var hour = input[0];
                var min = input[1] | 0;
        
                if (!!chk) {
                    parseInt(min/10, 10) == 0 ? min = min*10 : min = min;
                    o.hour = hour + ':' + parseInt(+(min*0.6), 10);
                } else {
                    o.num = +(parseFloat(hour) + parseFloat(min/60)).toFixed(2);
                    if (min == 0) { 
                        o.hour = hour + ':00'; 
                    }
                }
            }
        
            return o;
        },
        openNewWindow: function(url, title, w, h) {
            var left = (screen.width/2)-(w/2);
            var top = (screen.height/2)-(h/2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no,' +
            ' copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
        },
        netsuite: {
            check: {
                oneWorld: function() {
                    return nlapiGetContext().getFeature('SUBSIDIARIES');
                },
                closedPeriod: function(date, allownongl) {
                    var filters = [];
                    filters.push(new nlobjSearchFilter('startdate', null, 'onorbefore', date instanceof Date ? nlapiDateToString(date) : date));
                    filters.push(new nlobjSearchFilter('isquarter', null, 'is', 'F'));
                    filters.push(new nlobjSearchFilter('isyear', null, 'is', 'F'));
                
                    var columns = [];
                    columns.push(new nlobjSearchColumn('startdate').setSort(true));
                    columns.push(new nlobjSearchColumn('closed'));
                    columns.push(new nlobjSearchColumn('allownonglchanges'));
                
                    var sPeriod = nlapiSearchRecord('accountingperiod', null, filters, columns);
                    if (!!sPeriod) {
                        if (sPeriod[0].getValue('closed') == 'T') {
                            if (!!allownongl && sPeriod[0].getValue('allownonglchanges') == 'T') {
                                return false;
                            }
                            return true;
                        }
                    }
                
                    return false;
                }
            },
            get: {
                ultraSearch: function(recordType, searchId, filters, columns, page) {
                    if (!!searchId) {
                        var savedSearch = nlapiLoadSearch(recordType, searchId);
                        if (!!filters) {savedSearch.addFilters(filters);}
                    } else {
                        var savedSearch = nlapiCreateSearch(recordType, filters, columns);
                        deleteSearch = false;
                    }
                    
                    var resultset = savedSearch.runSearch();
                    var returnSearchResults = [];
                    var searchid = !page ? 0 : page*1000;
                    do {
                        var resultslice = resultset.getResults(searchid, searchid + 1000);
                        for ( var rs in resultslice) {
                            returnSearchResults.push(resultslice[rs]);
                            searchid++;
                        }
                    } while (!page && !!resultslice && resultslice.length >= 1000);
                
                    deleteSearch ? savedSearch.deleteSearch() : null;
                    return returnSearchResults;
                },
                recordNumber: function(type) {
                    var regex = new RegExp("[\\?&]rectype=([^&#]*)");
                    var result = regex.exec(nlapiResolveURL('RECORD', type));
                    return !result ? '' : result[1];
                },
                firstOpenDate: function() {
                    var filters = [];
                    filters.push(new nlobjSearchFilter('closed', null, 'is', 'F'));
                    filters.push(new nlobjSearchFilter('isquarter', null, 'is', 'F'));
                    filters.push(new nlobjSearchFilter('isyear', null, 'is', 'F'));
                
                    var columns = [];
                    columns.push(new nlobjSearchColumn('startdate').setSort());
                
                    var sPeriodo = nlapiSearchRecord('accountingperiod', null, filters, columns);
                    return !!sPeriodo ? sPeriodo[0].getValue('startdate') : null;
                } 
            },
            set: {
                note: function(record, type, id, title, message) {
                    var oNote = nlapiCreateRecord('note');
                    if (record == 'transaction') {
                        oNote.setFieldValue('transaction', id);
                    } else {
                        var recordtype = this.getRecordNumber(type);
                        if (!!recordtype) {
                            oNote.setFieldValue('record', id);
                            oNote.setFieldValue('recordtype', recordtype);
                        }
                    }
                    oNote.setFieldValue('title', title);
                    oNote.setFieldValue('note', message);
                    nlapiSubmitRecord(oNote);
                },
                summaryTable: function(netAmt, totalTax, grossAmt, currencySymbol, currInFront, lang) {
                    var net = '0'; var tax = '0'; var gross = '0'; var labels = [];
                    !(!isNaN(parseFloat(netAmt)) && isFinite(netAmt)) ? net = '0' : net = netAmt;
                    !(!isNaN(parseFloat(totalTax)) && isFinite(totalTax)) ? tax = '0' : tax = totalTax;
                    !(!isNaN(parseFloat(grossAmt)) && isFinite(grossAmt)) ? gross = '0' : gross = grossAmt;
                    currencySymbol == null ? symbol = '€' : symbol = currencySymbol;
                    lang != null && lang.trim().toUpperCase() == 'ES' ? labels = ['Resumen', 'Subtotal', 'Impuesto', 'Total'] : labels = ['Summary', 'Subtotal', 'Total Tax', 'Total'];
                    currInFront == null ? currInFront = false : null;
                    
                    var summaryTable = '<span class="bgmd totallingbg" style="display:inline-block; position:relative;left: -20px; padding: 10px 25px; margin-bottom:5px;">'
                    summaryTable += '<table class="totallingtable" cellspacing="2" cellpadding="0px" border="0px"><caption style="font-weight: bold;">'+labels[0]+'</caption>';
                    summaryTable += '<tr>';
                    summaryTable += '<td>';
                    summaryTable += '<div class="uir-field-wrapper"><span id="subtotal_fs_lbl_uir_label" class="smalltextnolink uir-label "><span id="subtotal_fs_lbl" class="smalltextnolink" style="">'+labels[1]+'</span></span>';
                    if (currInFront)
                        summaryTable += '<span id="summarynet" class="uir-field" style="font-weight: bold;">'+net+'</span><span class="uir-field">'+symbol+'</span>';		
                    else
                        summaryTable += '<span class="uir-field">'+symbol+'</span><span id="summarynet" class="uir-field" style="font-weight: bold;">'+net+'</span>';
                    summaryTable += '</div>';
                    summaryTable += '</td>';
                    summaryTable += '<td></td>';
                    summaryTable += '</tr><tr>';
                    summaryTable += '<td>';
                    summaryTable += '<div class="uir-field-wrapper"><span id="taxtotal_fs_lbl_uir_label" class="smalltextnolink uir-label "><span id="taxtotal_fs_lbl" class="smalltextnolink" style="">'+labels[2]+'</span></span>';
                    if (currInFront)
                        summaryTable += '<span id="summarytax" class="uir-field" style="font-weight: bold;">'+tax+'</span><span class="uir-field">'+symbol+'</span>'
                    else
                        summaryTable += '<span class="uir-field">'+symbol+'</span><span id="summarytax" class="uir-field" style="font-weight: bold;">'+tax+'</span>';
                    summaryTable += '</div>';
                    summaryTable += '</td>';
                    summaryTable += '<td></td>';
                    summaryTable += '</tr><tr>';
                    summaryTable += '<td colspan="3" class="uir-totallingtable-seperator"><div style="border-bottom: 1px solid #000000; width: 100%; font-size: 0px;"></div></td>';
                    summaryTable += '</tr><tr>';
                    summaryTable += '<td>';
                    summaryTable += '<div class="uir-field-wrapper"><span id="total_fs_lbl_uir_label" class="smalltextnolink uir-label "><span id="total_fs_lbl" class="smalltextnolink" style="">'+labels[3]+'</span></span>';
                    if (currInFront)
                        summaryTable += '<span id="summarygross" class="uir-field" style="font-weight: bold;">'+gross+'</span><span class="uir-field">'+symbol+'</span>'
                    else
                        summaryTable += '<span class="uir-field">'+symbol+'</span><span id="summarygross" class="uir-field" style="font-weight: bold;">'+gross+'</span>';
                    summaryTable += '</div>';
                    summaryTable += '</td>';
                    summaryTable += '<td></td>';
                    summaryTable += '</tr><tr>';
                    summaryTable += '</table>';
                    summaryTable += '</span>';
                    
                    return summaryTable;
                },
                setSummaryTable: function(amt, taxAmt, grossAmt) {                
                    !!document.getElementById('summarynet') ? document.getElementById('summarynet').innerHTML = amt : null; 
                    !!document.getElementById('summarytax') ? document.getElementById('summarytax').innerHTML = taxAmt : null; 
                    !!document.getElementById('summarygross') ? document.getElementById('summarygross').innerHTML = grossAmt : null;
                }
            },
            client: {
                loadAddons_SL: function(sl, listener) {
                    if (!sl) {return true;}
                
                    var line = 0;
                    var lines = nlapiGetLineItemCount(sl);
                    for(i = 1; i <= lines; i++){
                        if (!!document.getElementById(sl+'row'+line)) {
                            document.getElementById(sl+'row'+line).setAttribute('name', sl+'row'+i);
                            listener ? document.getElementById(sl+'row'+line).setAttribute(
                                'class', document.getElementById(sl+'row'+line).className+' selectlink'+i) : null;
                        }
                        line++;
                    }
                },
                setFilterArea_SL: function(filters, title, sl, nlines, tab, tabtitle, filterholder, lang) {
                    var fh = [];
                    var nfilters = (filters instanceof Array) ? filters.length : 0;
                    var lblPag = 'All';
                    var lblFilter = '';
                    var labels = false;
                    var splitPag = 300;
                
                    if (!nfilters) {return "";}
                    if (!tabtitle) {tabtitle = "Lineas";}
                    if (!nlines) {nlines = 0;}
                    if (!!filterholder) {
                        labels = true;
                        fh = filterholder.toString().split(",");
                    }		
                    lang = !lang ? 'EN' : lang;
                    
                    var str = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">';
                    str += '<div class="uir-machine-table-container" id="custpage_'+sl+'_filterarea_div">'
                    str += '<table class="uir-machine-table-container" style="border: 1px solid #dddddd; border-radius: 5px;"><tr style="background-color: #dddddd;">';
                    str += '<th height="100%" style="padding: 3px;" colspan="'+filters+'">';
                    str += '<a onclick="expandFilters(); return false;" style="text-decoration:none"><img id="collapseexpandbox" src="/images/forms/minus.svg" border="0" width="12" height="12"></a>';
                    str += '<span style="display:inline-block; width: 5px;"></span><span><b>'+title+'</b></span></th>';
                    str += '</tr><tr>';
                    for (var i = 0; i < nfilters; i++){
                        var valor = filters[i].split(":");
                        lblFilter = valor[0];
                        if (i > 0 && i%10 == 0){
                            str += '</tr><tr>';
                        }
                        if (labels && fh.length == filters) {
                            lblFilter = fh[i];
                        }
                        
                        str += '<td id="filterline'+i+'" name="filterline" height="100%" style="padding:3px;">';
                        if (valor.length < 2 || valor[1] == null || valor[1] == "" || valor[1].toLowerCase() == 'input') {
                            str += '<input style="padding: 3px; border: 1px solid #dddddd;" id="colfilter'+valor[0]+'" name="'+valor[0]+'" placeholder="'+lblFilter+'" onchange="filterFunctions_SL(\''+sl+'\', \''+filters+'\')">';
                        } else if (valor[1].toLowerCase() == 'checkbox') {
                            if (lang == 'ES') {
                                str += lblFilter+' <select id="colfilter'+valor[0]+'" name="'+valor[0]+'" onchange="filterFunctions_SL(\''+sl+'\', \''+filters+'\')"><option value="-">Todo</option><option value="T">Si</option><option value="F">No</option></select>';
                            } else {
                                str += lblFilter+' <select id="colfilter'+valor[0]+'" name="'+valor[0]+'" onchange="filterFunctions_SL(\''+sl+'\', \''+filters+'\')"><option value="-">All</option><option value="T">Yes</option><option value="F">No</option></select>'
                            }
                        }
                        str += '</td>';
                    }
                    str += '</tr></table>';
                    if (lang == 'ES') {
                        lblPag = 'Todo';
                        str += '<span id="faalert' + sl + '" style="display:none;margin:5px;"><i class="fa fa-warning" style="font-size:18px; color:#FFBF00;"></i><span style="display:inline-block; width: 5px;"></span><b>Aviso!</b> Los datos de la lista tienen filters aplicados.</span>';
                    } else {
                        str += '<span id="faalert' + sl + '" style="display:none;margin:5px;"><i class="fa fa-warning" style="font-size:18px; color:#FFBF00;"></i><span style="display:inline-block; width: 5px;"></span><b>Warning!</b> filters applied.</span>';
                    }
                    str += '</div>';
                
                    var pag = 0;
                    var strPag = '<span style="display:inline-block; width: 10px;"></span><select id="selpag' + sl + '" onchange="pagination_SL(\'' + sl + '\')"><option value=-1>' + lblPag + '</option>';
                    for (var i = 0; nlines > splitPag && i < nlines; i++) {
                        if (i % splitPag == 0) {
                            strPag += '<option value=' + pag + '>Pag #' + (++pag) + '</option>';
                        }
                    }
                    strPag += '</select>';
                
                    if (tab != null) {
                        tab.setLabel(tabtitle + ' - <span id="linfil'+sl+'" style="color:red">' + nlines + '</span> / <span>' + nlines + '</span>' + strPag);
                    }
                
                    return str;
                },
                expandFilters: function() {
                    var elements = !!document.getElementsByName('filterline') ? 
                        document.getElementsByName('filterline').length : 0;
                        
                    for (i = 0; i < elements; i++) {
                        if (document.getElementsByName('filterline')[i].style.display == 'none') {
                            document.getElementsByName('filterline')[i].style.display = null;
                            document.getElementById('collapseexpandbox').src = '/images/forms/minus.svg';
                        } else {
                            document.getElementsByName('filterline')[i].style.display = 'none';
                            document.getElementById('collapseexpandbox').src = '/images/forms/plus.svg';
                        }
                    }
                },
                pagination_SL: function() {
                    if (!sl) {return true;}
            
                    var pagina = document.getElementById('selpag'+sl).value;
                    var lines = nlapiGetLineItemCount(sl);
                    var limInf = parseInt(pagina, 10) * parseInt(splitPag, 10);
                    var limSup = parseInt(limInf, 10) + parseInt(splitPag, 10);
                    if (pagina > -1) {
                        for (i = 0; i < lines; i++) {
                            document.getElementById(sl+'row'+i).style.display = (i >= limInf && i < limSup) ? null : 'none';
                        }
                        var element = document.getElementById('linfil'+sl);
                        !!element ? element.innerHTML = splitPag: null;
                    } else {
                        for (i = 0; i < lines; i++) {
                            document.getElementById(sl+'row'+i).style.display = null;
                        }
                        var element = document.getElementById('linfil'+sl);
                        !!element ? element.innerHTML = lines: null;
                    }
                },
                filterFunctions_SL: function(sl, filters) {
                    if (!sl || !filters) {return true;}

                    var lines = nlapiGetLineItemCount(sl);
                    var filtersSplit = filters.split(",");
                    var nfilters = filtersSplit.length;
                    var excludeFilter = [];
                    var filtersApplied;
                    var linesNoFiltered = lines;
                    
                    for(i = 1; i <= lines; i++) {
                        filtersApplied = false;
                        for (j = 0; j < nfilters; j++){
                            var filter = filtersSplit[j].split(":");
                            if (document.getElementById('colfilter'+filter[0]) == null || document.getElementById('colfilter'+filter[0]).value == "") {
                                document.getElementById('colfilter'+filter[0]).style = 'padding: 3px; border: 1px solid #dddddd;';
                                continue;
                            }
                                
                            if (excludeFilter.indexOf(sl+"row"+i) < 0){
                                var filterValue = document.getElementById('colfilter'+filter[0]).value;
                                if (filterValue != '-') { //anulación para filters de tipo selección (=todo)
                                    if (filterValue.toLowerCase() == '@none@') { //se muestran valores vacíos o nulos
                                        filterValue = (nlapiGetLineItemValue(sl, filter[0], i).toLowerCase() == '') 
                                    } else {
                                        if (!nlapiGetLineItemValue(sl, filter[0], i).toLowerCase().includes('data_value')) {
                                            filterValue = (
                                                nlapiGetLineItemValue(sl, filter[0], i).toLowerCase().includes(filterValue.toLowerCase()) &&
                                                !nlapiGetLineItemValue(sl, filter[0], i).toLowerCase().includes('data_nofiltrable')
                                            );
                                        } else {
                                            var fld = nlapiGetLineItemValue(sl, filter[0], i).toLowerCase();
                                            filterValue = (
                                                fld.substring(fld.indexOf('¬'), fld.lastIndexOf('¬')).includes(filterValue.toLowerCase())
                                            );
                                        }
                                    }
                                }
                                if (filterValue != '-' && !filterValue) {
                                    excludeFilter.push(sl+"row"+i);
                                    linesNoFiltered--;
                                    document.getElementsByName(sl+"row"+i)[0].style.display = 'none';
                                }else{
                                    document.getElementsByName(sl+"row"+i)[0].style.display = null;
                                }
                                filtersApplied = true;
                                document.getElementById('colfilter'+filter[0]).style = 'padding: 3px; border: 1px solid #dddddd; box-shadow: 0 0 3px #CC0000;';
                            }
                        }
                        
                        if (!filtersApplied) {
                            document.getElementsByName(sl+"row"+i)[0].style.display = null;
                        }	
                    }
                
                    if (document.getElementById("linfil"+sl) != null) {
                        document.getElementById("linfil"+sl).innerHTML = linesNoFiltered;
                    }
                
                    if (lines == linesNoFiltered) {
                        document.getElementById('faalert' + sl).style.display = 'none';
                    } else {
                        document.getElementById('faalert' + sl).style.display = null;
                    }
                
                    return linesNoFiltered;
                },
                createPopup: function(url, width, height, title, sl, nonclosable, noresize, noreload) {
                    var listener = {
                        'close': function(win) {
                            if (sl != null) {
                                refreshMachine(sl);
                            } else {
                                window.onbeforeunload = null;
                                if (!noreload) location.reload();
                            }
                        }
                    };
                    nlNewExtOpenWindow(url, 'childdrecord', width, height, true, title, listener, null, nonclosable, noresize);

                    function nlNewExtOpenWindow(url, winname, width, height, scrollbars, winTitle, listeners, triggerObj, hideClose, blocksize){
                        url = addParamToURL(url, "ifrmcntnr", "T", true);
                        
                        if (!listeners)
                            listeners = {};
                        
                        if ( window.doPageLogging )
                            logStartOfRequest( 'extpopup' );
                    
                        var xPos = null;
                        var yPos = null;
                    
                        if (triggerObj != null && typeof triggerObj != 'undefined'){
                            xPos = findPosX(triggerObj);
                            yPos = findPosY(triggerObj);
                        }
                    
                        var extWindow = new Ext.Window({
                            title: (winTitle != undefined ? winTitle : winname),
                            id: winname,
                            name: winname,
                            stateful: false,
                            modal: true,
                            draggable : true,
                            autoScroll: scrollbars,
                            width: parseInt(''+width) + 20,
                            height: parseInt(''+height) + 30,
                            style: 'background-color: #FFFFFF;',
                            bodyStyle: 'background-color: #FFFFFF;',
                            resizable: blocksize ? false : true,
                            closable: hideClose ? false : true,
                            listeners : listeners,
                            bodyCfg: {
                                tag: 'iframe',
                                name: winname+'_frame',
                                id: winname+'_frame',
                                src: url,
                                width: (width+4)+'px',
                                height: height+'px',
                                style: 'border: 0 none; background-color: #FFFFFF;'
                             }
                        });
                    
                        if ((!isValEmpty(xPos))&&(!isValEmpty(yPos))){
                            extWindow.x = xPos;
                            extWindow.y = yPos;
                        }
                    
                        extWindow.show();
                        extWindow.syncSize();
                    }
                }
            },
            fields: {
                fieldsIntervalMap: {},
                splitPag: 300,
                isMandatory: function(id) {
                    if (!!document.getElementById(id) && document.getElementById(id).className.indexOf("inputreq") >= 0)
                        return true;
                    
                    return false;
                },
                setFocusToTextBox: function(id) {
                    !!document.getElementById(id) ? document.getElementById(id).focus() : null;
                },
                setDisplayType: function(id, display) {
                    var box = document.getElementById(id);
                    if (!box) {return true;}
                    box.style.display = !!display ? 'inline' : 'none';
                },
                setDisplayType: function(id, display) {
                    var box = document.getElementById(id);
                    if (!box) {return true;}
                    box.style.display = !!display ? 'inline' : 'none';
                },
                setBlinkText: function(id, bool, type) {
                    var box = document.getElementById(id);
                    if (!box) {return true;}
                    clearInterval(this.fieldsIntervalMap[id]);
                    var i = 0.05;
                    if (bool){
                        switch (type) {
                            case '1':
                                this.fieldsIntervalMap[id] = setInterval(function () {
                                    var opacity = window.getComputedStyle(box).opacity;
                                    box.style.opacity = parseFloat(opacity) - parseFloat(i);
                                    if (opacity == 0.3){
                                        i = -0.05;
                                    }else if (opacity == 1){
                                        i = 0.05;
                                    }
                                }, 35);
                            break;
                            default:
                                this.fieldsIntervalMap[id] = setInterval(function () {
                                    var opacity = window.getComputedStyle(box).opacity;
                                    box.style.opacity = parseFloat(opacity) - parseFloat(i);
                                    if (opacity == 0.5){
                                        box.style.opacity = 1;
                                    }else if (opacity == 1){
                                        i = 0.05;
                                    }
                                }, 100);
                            break;
                        }
                    }
                },
                setBlinkMultipleText: function(id, text, bool, onlytxt) {
                    var box = document.getElementById(id);
                    if (!box || !text) {return true;}
                    
                    var i = 0.05;
                    var module = text.length;
                    clearInterval(this.fieldsIntervalMap[id]);
                    box.innerHTML = "";
                    if (onlytxt){
                        box.innerHTML = iconos[icon] + '<span style="display:inline-block; width: 10px;"></span><span id="'+pId+'">' + text[0] + '</span>';
                        box = document.getElementById(pId);
                    }else{
                        box.innerHTML = iconos[icon] + '<span style="display:inline-block; width: 10px;"></span>' + text[0];
                    }
                    
                    var intervalMod = 0;
                    if (bool){
                        this.fieldsIntervalMap[id] = setInterval(function () {
                            var opacity = window.getComputedStyle(box).opacity;
                            box.style.opacity = parseFloat(opacity) - parseFloat(i);
                            if (opacity <= 0.5){
                                intervalMod++;
                                box.style.opacity = 1;
                                if (icon != null && iconos[icon] != null)
                                    box.innerHTML = iconos[icon] + '<span style="display:inline-block; width: 10px;"></span>' + text[intervalMod%module];
                                else
                                    box.innerHTML = text[intervalMod%module];
                            }else if (opacity == 1){
                                i = 0.05;
                            }
                        }, 140);
                    }
                },
                setBlinkField: function(id, bool) {
                    var field = nlapiGetField(id);
                    if (!field) { return true; }
                    switch (field.getType()) {
                        case 'select':
                            id = id + '_display';
                        break;
                    }

                    var box = document.getElementById(id);
                    if (!box) {return true;}
                    box.style.background = "#FFFFFF";
                    box.style.opacity = 1;
                    clearInterval(this.fieldsIntervalMap[id]);

                    if (!!bool) {
                        var i = 0.05;
                        box.style.background = "#F8E0E0";
                        this.fieldsIntervalMap[id] = setInterval(function () {
                            var opacity = window.getComputedStyle(box).opacity;
                            box.style.opacity = parseFloat(opacity) - parseFloat(i);
                            if (opacity <= 0.5){
                                box.style.opacity = 1;
                            }else if (opacity == 1){
                                i = 0.05;
                            }
                        }, 50)
                    }                    
                }
            }
        }
    }
}

// var rsm = new rsmLib();