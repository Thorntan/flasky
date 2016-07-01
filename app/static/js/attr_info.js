/**
 * Created by Timmy on 15/12/2.
 */

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
    {id: "status", name: "上线状态", field: "status"},
    {id: "visit_num", name: "热度", field: "visit_num"},
    {id: "attr_num_online", name: "线上景点数量", field: "attr_num_online", width: 120, formatter:trendFormatter},
	{id: "attr_num_cmt", name: "有评论线上景点", field: "attr_num_cmt", width: 130},
    {id: "attr_num_total", name: "景点总数", field: "attr_num_total"},
    {id: "attr_num_anno", name: "已标景点数量", field: "attr_num_anno", width: 120},
	{id: "attr_detail", name:"景点详情", field: "attr_detail", formatter:attrDetailFormatter},	
    {id: "attr_name_per", name: "名称可用占比/标注占比", field: "attr_name_per", width: 180, formatter:trendFormatter},
    {id: "attr_img_per", name: "图片可用占比/标注占比", field: "attr_img_per", width: 180, formatter:trendFormatter},
    {id: "attr_map_per", name: "坐标可用占比/标注占比", field: "attr_map_per", width: 180, formatter:trendFormatter},
    {id: "attr_open_per", name: "开关门可用占比/标注占比", field: "attr_open_per", width: 200, formatter:trendFormatter},
    {id: "attr_intensity_per", name: "游玩时间可用占比/标注占比", field: "attr_intensity_per", width: 220, formatter:trendFormatter},
    {id: "attr_ticket_per", name: "票价可用占比/标注占比", field: "attr_ticket_per", width: 180, formatter:trendFormatter},
    {id: "attr_desc_per", name: "描述可用占比/标注占比", field: "attr_desc_per", width: 180, formatter:trendFormatter},
    {id: "attr_anno_per", name: "标注完成度", field: "attr_anno_per", formatter:annoPerFormatter,width: 120}
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

function annoPerFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="anno_info.php?name='+dataContext['city']+'">'+value+'</a>';
}

function attrDetailFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="bw_list.php?cname='+value+'">详情</a>';
}

function trendFormatter(row, cell, value, columnDef, dataContext) {
	return '<a href="show_trend.php?cid='+dataContext['cid']+'&cname='+dataContext['city']+'&col='+value[1]+'&type=attr" target="_blank">'+value[0]+'</a>';
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
            if (idList[i] == sourceData[j].id) {
                tmp["No."] = j+1;
                tmp["城市名"] = sourceData[j].name;
                tmp["城市ID"] = sourceData[j].id;
                tmp["国家"] = sourceData[j].country;
                tmp["上线状态"] = sourceData[j].status;
                tmp["热度"] = sourceData[j].visit_num;
                tmp["线上景点数"] = sourceData[j].attr_num_online;
				tmp["有评论线上景点"] = sourceData[j].attr_num_cmt;
                tmp["景点总数"] = sourceData[j].attr_num_total;
				tmp["已标景点数"] = sourceData[j].attr_num_anno;
				tmp["名称可用占比/标注占比"] = (parseFloat(sourceData[j].attr_name_use)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].attr_name_anno)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%';
				tmp["图片可用占比/标注占比"] = (parseFloat(sourceData[j].attr_img_use)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].attr_img_anno)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%';
				tmp["坐标可用占比/标注占比"] = (parseFloat(sourceData[j].attr_map_use)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].attr_map_anno)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%';
				tmp["开关门可用占比/标注占比"] = (parseFloat(sourceData[j].attr_open_use)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].attr_open_anno)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%';
				tmp["游玩时间可用占比/标注占比"] = (parseFloat(sourceData[j].attr_intensity_use)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].attr_intensity_anno)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%';
				tmp["票价可用占比/标注占比"] = (parseFloat(sourceData[j].attr_ticket_use)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].attr_ticket_anno)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%';
				tmp["描述可用占比/标注占比"] = (parseFloat(sourceData[j].attr_desc_use)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].attr_desc_anno)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%';
				tmp["标注完成度"] = sourceData[j].attr_done_task + '/' + sourceData[j].attr_num_task;
                break;
            }
        }
        data[i] = tmp;
    }
	console.log(data);
    $('<form action="ajax/ajax.php?action=attr_info_export" method="POST" enctype="multipart/form-data">' +
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
			"sel":line.id,
            "id":++cnt,
            "city":line.name,
            "cid":line.id,
            "country":line.country,
            "status":line.status,
            "visit_num":line.visit_num,
            "attr_num_online":[line.attr_num_online,'online'],
			"attr_num_cmt":line.attr_num_cmt,
            "attr_num_total":line.attr_num_total,
            "attr_num_anno":line.attr_num_anno,
			"attr_detail":line.name,
            "attr_name_per":[(parseFloat(line.attr_name_use)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%/' + (parseFloat(line.attr_name_anno)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%','name'],
            "attr_img_per":[(parseFloat(line.attr_img_use)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%/' + (parseFloat(line.attr_img_anno)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%','image'],
            "attr_map_per":[(parseFloat(line.attr_map_use)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%/' + (parseFloat(line.attr_map_anno)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%','map_info'],
            "attr_open_per":[(parseFloat(line.attr_open_use)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%/' + (parseFloat(line.attr_open_anno)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%','open'],
            "attr_intensity_per":[(parseFloat(line.attr_intensity_use)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%/' + (parseFloat(line.attr_intensity_anno)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%','intensity'],
            "attr_ticket_per":[(parseFloat(line.attr_ticket_use)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%/' + (parseFloat(line.attr_ticket_anno)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%','ticket'],
            "attr_desc_per":[(parseFloat(line.attr_desc_use)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%/' + (parseFloat(line.attr_desc_anno)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%','description'],
            "attr_anno_per":line.attr_done_task + '/' + line.attr_num_task
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
    var cityID = $('#cityID').val() !="" ? $('#cityID').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    //console.log(cityID);
    var cityName = $('#cityName').val() != "" ? $('#cityName').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    //console.log(cityName);
    var country = $('#country').val() != "" ? $('#country').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    //console.log(country);
    var status = $('#status').val();
	var continent = $('#continentList').val() || [];
    //console.log(status);
    var city_type = $('#city_type').val();
    //console.log(city_type);
    var sortTag = $('#sortTag').val();
    //console.log(sortTag);
    var sortOrder = $('#sortOrder').val() == "positive" ? "" : "DESC";
    //console.log(sortOrder);

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=attr_info",
        dataType: "json",
        data: {
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
    $("#cityID").val(id);
    doQuery();
}
