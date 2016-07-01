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
    {id: "rest_num_online", name: "线上餐馆数量", field: "rest_num_online", width: 120, formatter:trendFormatter},
	{id: "rest_num_cmt", name: "有评论线上餐馆", field: "rest_num_cmt", width: 140},
    {id: "rest_num_total", name: "餐馆总数", field: "rest_num_total"},
    {id: "rest_num_anno", name: "已标餐馆数量", field: "rest_num_anno", width: 120},
	{id: "rest_detail", name:"餐馆详情", field: "rest_detail", formatter:restDetailFormatter},	
    {id: "rest_name_per", name: "名称可用占比/标注占比", field: "rest_name_per", width: 180, formatter:trendFormatter},
    {id: "rest_map_per", name: "坐标可用占比/标注占比", field: "rest_map_per", width: 180, formatter:trendFormatter},
    {id: "rest_open_per", name: "开关门可用占比/标注占比", field: "rest_open_per", width: 200, formatter:trendFormatter},
    {id: "rest_img_per", name: "图片可用占比/标注占比", field: "rest_img_per", width: 180, formatter:trendFormatter},
    {id: "rest_address_per", name: "地址可用占比", field: "rest_address_per", width: 220, formatter:trendFormatter},
    {id: "rest_cuisines_per", name: "菜系可用占比/标注占比", field: "rest_cuisines_per", width: 180, formatter:trendFormatter},
    {id: "rest_options_per", name: "options可用占比/标注占比", field: "rest_options_per", width: 180, formatter:trendFormatter},
    {id: "rest_level_per", name: "level可用占比/标注占比", field: "rest_level_per", width: 180},
    {id: "rest_anno_per", name: "标注完成度", field: "rest_anno_per", formatter:annoPerFormatter,width: 120}
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
    return '<a href="rest_anno_info.php?name='+dataContext['city']+'">'+value+'</a>';
//    return '暂无';
}

function restDetailFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="rest_bw_list.php?cname='+value+'">详情</a>';
}

function trendFormatter(row, cell, value, columnDef, dataContext) {
	return '<a href="show_trend.php?cid='+dataContext['cid']+'&cname='+dataContext['city']+'&col='+value[1]+'&type=rest" target="_blank">'+value[0]+'</a>';
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
                tmp["线上景点数"] = sourceData[j].rest_num_online;
				tmp["有评论线上景点"] = sourceData[j].rest_num_cmt;
                tmp["景点总数"] = sourceData[j].rest_num_total;
				tmp["已标景点数"] = sourceData[j].rest_num_anno;
				tmp["名称可用占比/标注占比"] = (parseFloat(sourceData[j].rest_name_use)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].rest_name_anno)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%';
				tmp["坐标可用占比/标注占比"] = (parseFloat(sourceData[j].rest_map_use)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].rest_map_anno)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%';
				tmp["开关门可用占比/标注占比"] = (parseFloat(sourceData[j].rest_open_use)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].rest_open_anno)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%';
				tmp["图片可用占比/标注占比"] = (parseFloat(sourceData[j].rest_img_use)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].rest_img_anno)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%';
				tmp["地址可用占比"] = (parseFloat(sourceData[j].rest_address_use)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%';
				tmp["菜系可用占比/标注占比"] = (parseFloat(sourceData[j].rest_cuisines_use)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].rest_cuisines_anno)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%';
				tmp["options可用占比/标注占比"] = (parseFloat(sourceData[j].rest_options_use)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].rest_options_anno)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%';
				tmp["level可用占比/标注占比"] = (parseFloat(sourceData[j].rest_level_use)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%/' + (parseFloat(sourceData[j].rest_level_anno)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%';
				tmp["标注完成度"] = sourceData[j].rest_done_task + '/' + sourceData[j].rest_num_task;
                break;
            }
        }
        data[i] = tmp;
    }
	console.log(data);
    $('<form action="ajax/ajax.php?action=rest_info_export" method="POST" enctype="multipart/form-data">' +
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
            "rest_num_online":[line.rest_num_online,'online'],
			"rest_num_cmt": line.rest_num_cmt,
            "rest_num_total":line.rest_num_total,
            "rest_num_anno":line.rest_num_anno,
			"rest_detail":line.name,
            "rest_name_per":[(parseFloat(line.rest_name_use)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%/' + (parseFloat(line.rest_name_anno)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%','name'],
            "rest_map_per":[(parseFloat(line.rest_map_use)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%/' + (parseFloat(line.rest_map_anno)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%','map_info'],
            "rest_open_per":[(parseFloat(line.rest_open_use)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%/' + (parseFloat(line.rest_open_anno)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%','open'],
            "rest_img_per":[(parseFloat(line.rest_img_use)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%/' + (parseFloat(line.rest_img_anno)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%','image'],
            "rest_address_per":[(parseFloat(line.rest_address_use)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%','address'],
            "rest_cuisines_per":[(parseFloat(line.rest_cuisines_use)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%/' + (parseFloat(line.rest_cuisines_anno)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%','cuisines'],
            "rest_options_per":[(parseFloat(line.rest_options_use)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%/' + (parseFloat(line.rest_options_anno)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%','options'],
            "rest_level_per":(parseFloat(line.rest_level_use)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%/' + (parseFloat(line.rest_level_anno)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%',
            "rest_anno_per":line.rest_done_task + '/' + line.rest_num_task
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
        url: "ajax/ajax.php?action=rest_info",
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
