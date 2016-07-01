/**
 * Created by Timmy on 15/12/1.
 */

/*$(document).ready(function() {
    $('#continentList').multiselect({
        nonSelectedText: '选择大洲',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });
});
*/
var sourceData=[];
var selectArray=[];
var grid;
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
    checkboxSelector.getColumnDefinition(),
    {id: "id", name:"No.", field: "id", width:50},
    {id: "cname", name: "名称", field: "cname"},
    {id: "cnt_online", name: "线上城市数", field: "cnt_online", width:120},
    {id: "cnt_total", name: "总城市数", field: "cnt_total", width:120},
    {id: "attr_num_online", name: "线上景点数", field: "attr_num_online", width:120, formatter:trendFormatter},
    {id: "attr_num_total", name: "景点总数", field: "attr_num_total"},
    {id: "hotel_num_online", name: "线上酒店数", field: "hotel_num_online", width:120},
    {id: "hotel_num_total", name: "酒店总数", field: "hotel_num_total"},
    {id: "shop_num_online", name: "线上购物数", field: "shop_num_online", width:120,formatter:trendFormatter},
    {id: "shop_num_total", name: "购物总数", field: "shop_num_total"},
    {id: "rest_num_online", name: "线上餐厅数", field: "rest_num_online", width:120,formatter:trendFormatter},
    {id: "rest_num_total", name: "餐厅总数", field: "rest_num_total"},
    {id: "city_detail", name: "城市详情", field: "city_detail", formatter:cityDetailFormatter}
];

var options = {
    enableAddRow:false,
    enableCellNavigation: true,
    enableColumnReorder: false,
    syncColumnCellResize: true,
    enableTextSelectionOnCells: true,
    editable: false
};

$(function(){
    dataView = new Slick.Data.DataView({ inlineFilters: true });
    grid = new Slick.Grid("#info", dataView, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel());
    grid.registerPlugin(checkboxSelector);
    var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
    var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);

    dataView.setPagingOptions({pageSize: 10});

    dataView.onRowCountChanged.subscribe(function (e, args) {
        grid.updateRowCount();
        grid.render();
    });

    dataView.onRowsChanged.subscribe(function (e, args) {
        grid.invalidateRows(args.rows);
        grid.render();
    });

    dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
        var isLastPage = pagingInfo.pageNum == pagingInfo.totalPages - 1;
        var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
        var options = grid.getOptions();

        if (options.enableAddRow != enableAddRow) {
            grid.setOptions({enableAddRow: enableAddRow});
        }
    });
});

function attrDetailFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="attr_info.php?id='+value+'")">详情</a>';
}

function shopDetailFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="shop_info.php?id='+value+'")">详情</a>';
}

function restDetailFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="rest_info.php?id='+value+'")">详情</a>';
}

function cityDetailFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="city_info.php?cname='+value+'")">详情</a>';
}

function trendFormatter(row, cell, value, columnDef, dataContext) {
	return '<a href="show_all_trend.php?source='+dataContext['cname']+'&table='+value[1]+'&col=online&type=0" target="_blank">'+value[0]+'</a>';
}
/* Export
 ----------------------------------*/
$("#exportToCSV").click(function () {
    var idList = getSelectedArray();
    var data = {};
    var tmp = {};
    for (var i = 0; i < idList.length; ++i) {
        tmp = {};
        for (var j = 0; j < sourceData.length; ++j) {
            if (idList[i] == j+1) {
                tmp["No."] = j+1;
                tmp["大洲名"] = sourceData[j].name;
                tmp["线上城市数"] = sourceData[j].city_online;
                tmp["总城市数"] = sourceData[j].city_total;
                tmp["线上景点数"] = sourceData[j].attr_num_online;
                tmp["景点总数"] = sourceData[j].attr_num_total;
                tmp["线上酒店数"] = sourceData[j].hotel_num_online;
                tmp["酒店总数"] = sourceData[j].hotel_num_total;
                tmp["线上购物数"] = sourceData[j].shop_num_online;
                tmp["购物总数"] = sourceData[j].shop_num_total;
                tmp["线上餐厅数"] = sourceData[j].rest_num_online;
                tmp["餐厅总数"] = sourceData[j].rest_num_total;
                break;
            }
        }
        data[i] = tmp;
    }
	console.log(data);
    $('<form action="ajax/ajax.php?action=continent_info_export" method="POST" enctype="multipart/form-data">' +
    '<textarea type="hidden" name="data">' + JSON.stringify(data) + '</textarea>' +
    '</form>').submit();
});

function getSelectedArray() {
    var idList = [];
    var curData = dataView.getItems();
    for (var i = 0; i < curData.length; ++i) {
        if (curData[i].checked == 1) {
            idList.push(curData[i].sel);
        }
    }
    return idList;
}

/* Select All
 ----------------------------------*/
$("#selectAll").click(function() {
    var curData = dataView.getItems();
    grid.invalidateAllRows();
    selectArray = [];
    if ($("#selectAll").prop("checked")) {
        for (var i = 0; i < curData.length; ++i) {
            curData[i].checked = 1;
            selectArray.push(i);
        }
        $("#selectHeader").prop('checked','checked');
    } else {
        for (var i = 0; i < curData.length; ++i) {
            curData[i].checked = 0;
        }
        selectArray = [];
        $("#selectHeader").removeProp('checked');
    }
    dataView.setItems(curData);
    grid.render();
});

/* Query
 ----------------------------------*/
function makeTable(data) {
    sourceData = data;
    var newData = [];
    var cnt = 0;
    data.forEach(function(line) {
        var obj = {
            "checked":0,
            "id":++cnt,
			"sel":cnt,
            "cname":line.name,
            "cnt_online":line.city_online,
            "cnt_total":line.city_total,
            "attr_num_online":[line.attr_num_online,'attr'],
            "attr_num_total":line.attr_num_total,
            "hotel_num_online":line.hotel_num_online,
            "hotel_num_total":line.hotel_num_total,
            "shop_num_online":[line.shop_num_online,'shop'],
            "shop_num_total":line.shop_num_total,
            "rest_num_online":[line.rest_num_online,'rest'],
            "rest_num_total":line.rest_num_total,
            "city_detail":line.name
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
    var status = $('#status').val();
    //console.log(status);
    var city_type = $('#city_type').val();
    //console.log(city_type);

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=continent_info",
        dataType: "json",
        data: {
        },
        beforeSend: function() {
            $("#over").css("display","block");
            $("#layout").css("display","block");
        },
        complete: function() {
            $("#over").css("display","none");
            $("#layout").css("display","none");
        },
        success: function(data) {
            if (data.status == 0) {
                makeTable(data.msg);
                console.log(data.msg);
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
}
