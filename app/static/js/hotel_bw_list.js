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
    {id: "city_id", name: "城市ID", field: "city_id"},
    {id: "city_name", name: "城市名称", field: "city_name"},
    {id: "country", name: "国家", field: "country"},
    {id: "hotel_id", name: "酒店ID", field: "hotel_id"},
    {id: "hotel_name", name: "酒店名称", field: "hotel_name"},
	{id: "hotel_name_en",name:"酒店英文名",field:"hotel_name_en"},
	{id: "map_info",name:"坐标",field:"map_info"},
	{id: "address",name:"地址",field:"address"},
	{id: "star",name:"星级",field:"star"},
	{id: "grade",name:"评分",field:"grade"},
	{id: "all_grade",name:"详细评分",field:"all_grade"},
	{id: "source",name:"数据来源",field:"source"},
	{id: "comment_num",name:"评论数",field:"comment_num"},
	{id: "img_num",name:"图片数",field:"img_num"},
	{id: "img_list",name:"图片",field:"img_list",width:300}
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
                break;
            }
        }
        data[i] = tmp;
    }
	console.log(data);
    $('<form action="ajax/ajax.php?action=hotel_info_export" method="POST" enctype="multipart/form-data">' +
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
    data.forEach(function(line) {
	var img = line.img_list!="" ? line.img_list.replace(/ /g,'').split('|'):[];
        var obj = {
		"checked":0,
		"sel":line.id,
            	"id":++cnt,
            	"city_id":line.city_id,
            	"city_name":line.city_name,
            	"country":line.country,
		"hotel_id":line.hotel_id,
		"hotel_name":line.hotel_name,
		"hotel_name_en":line.hotel_name_en,
		"map_info":line.map_info,
		"address":line.address,
		"star":line.star,
		"grade":line.grade,
		"all_grade":line.all_grade,
		"source":line.source,
		"comment_num":line.comment_num,
		"img_num":img.length,
		"img_list":line.img_list
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
    var hotelID = $('#hotelID').val() !="" ? $('#hotelID').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    var hotelName = $('#hotelName').val() != "" ? $('#hotelName').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    var cityID = $('#cityID').val() !="" ? $('#cityID').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    console.log(hotelID);
    console.log(hotelName);
    console.log(cityID);
    var cityName = $('#cityName').val() != "" ? $('#cityName').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    console.log(cityName);
    var country = $('#country').val() != "" ? $('#country').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    console.log(country);
    var status = $('#status').val();
    var continent = $('#continentList').val() || [];
    console.log(continent);
    console.log(status);
    var city_type = $('#city_type').val();
    console.log(city_type);
    var sortTag = $('#sortTag').val();
    console.log(sortTag);
    var sortOrder = $('#sortOrder').val() == "positive" ? "" : "DESC";
    console.log(sortOrder);

    $.ajax({
        type: "POST",
        url: "/get_hotel",
        dataType: "json",
        data: {
	    	hotelID:hotelID,
	    	hotelName:hotelName,
            cityID:cityID,
            cityName:cityName,
            country:country,
			continent:continent,
            status:status,
            city_type:city_type,
            sortTag:sortTag,
            sortOrder:sortOrder
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

/* From City Info
 ----------------------------------*/
function showAttr(id) {
    $("#hotelID").val(id);
    doQuery();
}
