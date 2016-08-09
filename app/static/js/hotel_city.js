$(document).ready(function() {
    $('#continentList').multiselect({
        nonSelectedText: '选择大洲',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });
});
var sourceData=[];
var grid;
var selectArray=[];
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
    checkboxSelector.getColumnDefinition(),
    {id: "id", name:"No.", field: "id", width:50},
    {id: "city", name: "城市名称", field: "city"},
    {id: "cid", name: "城市ID", field: "cid"},
    {id: "country", name: "国家", field: "country"},
    {id: "city_status", name: "上线状态", field: "city_status"},
    {id: "visit_num", name: "热度", field: "visit_num"},
    {id: "hotel_num_online", name: "线上酒店数量", field: "hotel_num_online", width: 120},
    {id: "hotel_num_total", name: "酒店总数", field: "hotel_num_total"},
    {id: "hotel_image_total", name: "有图酒店总数", field: "hotel_image_total",width: 120},
    {id: "hotel_name_total", name: "有中文名称的酒店数", field: "hotel_name_total",width: 120},
    {id: "hotel_name_en_total", name: "有英文名称的酒店数", field: "hotel_name_en_total",width: 120},
    {id: "hotel_comment_total", name: "有评论的酒店数", field: "hotel_comment_total",width: 120}
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


/* Export
 ----------------------------------*/
$("#exportToCSV").click(function () {
    var idList = getSelectedArray();
    var data = {};
    var tmp = {};
    for (var i = 0; i < idList.length; ++i) {
        tmp = {};
        for (var j = 0; j < sourceData.length; ++j) {
            if (idList[i] == sourceData[j].id) {
                tmp["No."] = j+1;
                tmp["城市名"] = sourceData[j].city_name;
                tmp["城市ID"] = sourceData[j].city_id;
                tmp["国家"] = sourceData[j].country;
                tmp["酒店ID"] = sourceData[j].city_status;
                break;
            }
        }
        data[i] = tmp;
    }
	console.log(data);
    $('<form action="export" method="POST" enctype="multipart/form-data">' +
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
    console.log("maketable");
	console.log(data)
    data.forEach(function(line) {
        var obj = {
		"checked":0,
		"sel":line.id,
            	"id":++cnt,
            	"city":line.name,
            	"cid":line.id,
            	"country":line.country,
            	"city_status":line.city_status,
            	"visit_num":line.visit_num,
            	"hotel_num_online":line.hotel_num_online,
            	"hotel_num_total":line.hotel_num_total,
            	"hotel_image_total":line.hotel_image_total,
            	"hotel_name_total":line.hotel_name_total,
            	"hotel_name_en_total":line.hotel_name_en_total,
            	"hotel_comment_total":line.hotel_comment_total
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
	var cityID = $('#cityID').val();
	var cityName = $('#cityName').val();
	var country = $('#country').val();
	var city_status = $('#city_status').val();
    var city_type = $('#city_type').val();
    var sortTag = $('#sortTag').val();
    var sortOrder = $('#sortOrder').val();
	var environment = $('#environment').val();
	console.log('********'+cityID)

    $.ajax({
        type: "POST",
        url: "get_hotel_city",
        dataType: "json",
        data: {
            "cityID":cityID,
            "cityName":cityName,
            "country":country,
            "city_status":city_status,
            "city_type":city_type,
            "sortTag":sortTag,
            "sortOrder":sortOrder,
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
    $("#cityID").val(id);
    doQuery();
}
