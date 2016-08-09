var sourceData=[];
var selectArray=[];
var grid;
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
    checkboxSelector.getColumnDefinition(),
    {id: "id", name:"No.", field: "id", width:50},
    {id: "city", name: "城市名称", field: "city"},
    {id: "city_id", name: "城市ID", field: "city_id"},
    {id: "country", name: "国家", field: "country"},
    {id: "city_status", name: "上线状态", field: "city_status"},
    {id: "visit_num", name: "热度", field: "visit_num"},

    {id: "hotel_total", name: "线上酒店数量", field: "hotel_total", width:120},
    {id: "hotel_comment_percentage", name:"线上酒店有评论比例", field: "hotel_comment_percentage", width: 160},
    {id: "hotel_image_percentage", name: "线上酒店有图比例", field: "hotel_image_percentage", width:150},
    {id: "hotel_detail", name: "酒店信息", field: "hotel_detail", formatter:hotelDetailFormatter},

    {id: "attr_total", name: "线上景点数量", field: "attr_total", width:120},
    {id: "attr_comment_percentage", name:"线上景点有评论比例", field: "attr_comment_percentage", width: 160},
    {id: "attr_image_percentage", name: "线上景点有图比例", field: "attr_image_percentage", width:150},
    {id: "attr_detail", name: "景点信息", field: "attr_detail", formatter:attrDetailFormatter},

    {id: "rest_total", name: "线上餐厅数量", field: "rest_total", width:120},
    {id: "rest_comment_percentage", name:"线上餐厅有评论比例", field: "rest_comment_percentage", width: 160},
    {id: "rest_image_percentage", name: "线上餐厅有图比例", field: "rest_image_percentage", width:150},
    {id: "rest_detail", name: "餐厅信息", field: "rest_detail", formatter:restDetailFormatter},

    {id: "shop_total", name: "线上购物数量", field: "shop_total", width:120},
    {id: "shop_comment_percentage", name:"线上购物有评论比例", field: "shop_comment_percentage", width: 160},
    {id: "shop_image_percentage", name: "线上购物有图比例", field: "shop_image_percentage", width:150},
    {id: "shop_detail", name: "购物信息", field: "shop_detail", formatter:shopDetailFormatter}

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

function hotelDetailFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="hotel_info.php?id='+value+'")">详情</a>';
}


function trendFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="show_trend.php?city_id='+dataContext['city_id']+'&cname='+dataContext['city']+'&col='+value[1]+'&type='+value[2]+'" target="_blank">'+value[0]+'</a>';
}


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
    console.log("maketable");
	console.log(data)
    data.forEach(function(line) {
        var obj = {
            "checked":0,
            "sel":line.id,
            "id":++cnt,
            "city":line.name,
            "city_id":line.id,
            "country":line.country,
            "city_status":line.city_status,
            "visit_num":line.visit_num,
            "hotel_total":line.hotel_total,
            "hotel_image_percentage":line.hotel_image_percentage,
            "hotel_comment_percentage":line.hotel_comment_percentage,
            "attr_total":line.attr_total,
            "attr_image_percentage":line.attr_image_percentage,
            "attr_comment_percentage":line.attr_comment_percentage,
            "rest_total":line.rest_total,
            "rest_image_percentage":line.rest_image_percentage,
            "rest_comment_percentage":line.rest_comment_percentage,
            "shop_total":line.shop_total,
            "shop_image_percentage":line.shop_image_percentage,
            "shop_comment_percentage":line.shop_comment_percentage,
            "hotel_detail":line.id,
            "attr_detail":line.id,
            "rest_detail":line.id,
            "shop_detail":line.id	
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
	var city_name = $("#city_name").val();

    $.ajax({
        type: "POST",
        url: "/get_all_city",
        dataType: "json",
        data: {
            "city_name":city_name,
			"environment":environment
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
                console.log("OKOKOK");
                makeTable(data.result);
                console.log(data.result);
            } else {
                console.log("wrongwrong");
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
}

/* From City Info
 ----------------------------------*/
function showAttr(id) {
    $("#city_name").val(id);
    doQuery();
}
