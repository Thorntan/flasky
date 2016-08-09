(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "CheckboxSelectColumn": CheckboxSelectColumn
        }
    });


    function CheckboxSelectColumn(options) {
        var _grid;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _selectedRowsLookup = {};
        var _defaults = {
            columnId: "_checkbox_selector",
            cssClass: null,
            toolTip: "Select/Deselect All",
            width: 30
        };

        var _options = $.extend(true, {}, _defaults, options);

        function init(grid) {
            _grid = grid;
            _handler
                .subscribe(_grid.onSelectedRowsChanged, handleSelectedRowsChanged)
                .subscribe(_grid.onClick, handleClick)
                .subscribe(_grid.onHeaderClick, handleHeaderClick)
                .subscribe(_grid.onKeyDown, handleKeyDown);
        }

        function destroy() {
            _handler.unsubscribeAll();
        }

        function handleSelectedRowsChanged(e, args) {
            //console.log('ss');
            //var selectedRows = _grid.getSelectedRows();
            //var lookup = {}, row, i;
            //for (i = 0; i < selectedRows.length; i++) {
            //    row = selectedRows[i];
            //    lookup[row] = true;
            //    if (lookup[row] !== _selectedRowsLookup[row]) {
            //        _grid.invalidateRow(row);
            //        delete _selectedRowsLookup[row];
            //    }
            //}
            //for (i in _selectedRowsLookup) {
            //    _grid.invalidateRow(i);
            //}
            //_selectedRowsLookup = lookup;
            //_grid.render();
            //
            //if (selectedRows.length == _grid.getDataLength()) {
            //    _grid.updateColumnHeader(_options.columnId, "<input type='checkbox' checked='checked'>", _options.toolTip);
            //} else {
            //    _grid.updateColumnHeader(_options.columnId, "<input type='checkbox'>", _options.toolTip);
            //}

            var sum = 0;
            for (var i = 0; i < _grid.getDataLength(); ++i) {
                sum += dataView.getItemByIdx(dataView.getPagingInfo().pageNum*dataView.getPagingInfo().pageSize+i)['checked'];
            }
            if (sum == _grid.getDataLength()) {
                _grid.updateColumnHeader(_options.columnId, "<input type='checkbox' checked='checked' id='selectHeader'>", _options.toolTip);
            } else {
                _grid.updateColumnHeader(_options.columnId, "<input type='checkbox' id='selectHeader'>", _options.toolTip);
            }


        }

        function handleKeyDown(e, args) {
            if (e.which == 32) {
                if (_grid.getColumns()[args.cell].id === _options.columnId) {
                    // if editing, try to commit
                    if (!_grid.getEditorLock().isActive() || _grid.getEditorLock().commitCurrentEdit()) {
                        toggleRowSelection(args.row);
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        }

        function handleClick(e, args) {
            // clicking on a row select checkbox
            if (_grid.getColumns()[args.cell].id === _options.columnId && $(e.target).is(":checkbox")) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                //toggleRowSelection(args.row);
                toggleRowSelection(args.row);
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }

        function toggleRowSelection(row) {
            //if (_selectedRowsLookup[row]) {
            //    _grid.setSelectedRows($.grep(_grid.getSelectedRows(), function (n) {
            //        return n != row
            //    }));
            //} else {
            //    _grid.setSelectedRows(_grid.getSelectedRows().concat(row));
            //}

            var pos = dataView.getPagingInfo().pageNum*dataView.getPagingInfo().pageSize+row;
            _grid.invalidateRow(row);
            dataView.getItemByIdx(pos)['checked'] = 1-dataView.getItemByIdx(pos)['checked'];
            _grid.render();
            _grid.setSelectedRows(_grid.getSelectedRows().concat(row));

            if (dataView.getItemByIdx(pos)['checked']) {
                selectArray.push(pos);
            } else {
                selectArray.splice(selectArray.indexOf(pos),1);
            }
            if (selectArray.length == sourceData.length) {
                $("#selectAll").prop("checked","checked");
            } else {
                $("#selectAll").removeProp("checked");
            }
        }

        function handleHeaderClick(e, args) {
            if (args.column.id == _options.columnId && $(e.target).is(":checkbox")) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                var pos = 0;
                if ($(e.target).is(":checked")) {
                    //var rows = [];
                    //for (var i = 0; i < _grid.getDataLength(); i++) {
                    //    rows.push(i);
                    //}
                    //_grid.setSelectedRows(rows);

                    for (var i = 0; i < _grid.getDataLength(); ++i) {
                        _grid.invalidateRow(i);
                        pos = dataView.getPagingInfo().pageNum*dataView.getPagingInfo().pageSize+i;
                        dataView.getItemByIdx(pos)['checked'] = 1;
                        if (selectArray.indexOf(pos) == -1) {
                            selectArray.push(pos);
                        }
                    }
                    _grid.render();
                } else {
                    //_grid.setSelectedRows([]);
                    for (var i = 0; i < _grid.getDataLength(); ++i) {
                        _grid.invalidateRow(i);
                        pos = dataView.getPagingInfo().pageNum*dataView.getPagingInfo().pageSize+i;
                        dataView.getItemByIdx(pos)['checked'] = 0;
                        if (selectArray.indexOf(pos) != -1) {
                            selectArray.splice(selectArray.indexOf(pos),1);
                        }
                    }
                    _grid.render();
                }
                if (selectArray.length == sourceData.length) {
                    $("#selectAll").prop("checked","checked");
                } else {
                    $("#selectAll").removeProp("checked");
                }
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }

        function getColumnDefinition() {
            return {
                id: _options.columnId,
                name: "<input type='checkbox' id='selectHeader'>",
                toolTip: _options.toolTip,
                field: "sel",
                width: _options.width,
                resizable: false,
                sortable: false,
                cssClass: _options.cssClass,
                formatter: checkboxSelectionFormatter
            };
        }

        function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
                return dataView.getItemById(dataContext['id'])['checked']
                    ? "<input type='checkbox' checked='checked' name='nameCheckBox' value='"+value+"'>"
                    : "<input type='checkbox'name='nameCheckBox' value='"+value+"'>"
            }
            return null;
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,

            "getColumnDefinition": getColumnDefinition
        });
    }
})(jQuery);