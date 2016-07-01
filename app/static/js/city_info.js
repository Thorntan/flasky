/**
 * Created by Timmy on 15/12/1.
 */

$(document).ready(function() {
    $('#continentList').multiselect({
        nonSelectedText: '选择大洲',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });
});

var sourceData=[];
var selectArray=[];
var grid;
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
    checkboxSelector.getColumnDefinition(),
    {id: "id", name:"No.", field: "id", width:50},
    {id: "city", name: "城市名称", field: "city"},
    {id: "cid", name: "城市ID", field: "cid"},
    {id: "country", name: "国家", field: "country"},
    {id: "status", name: "上线状态", field: "status"},
    {id: "visit_num", name: "热度", field: "visit_num"},
    {id: "attr_num_online", name: "线上景点数量", field: "attr_num_online", width:120, formatter:trendFormatter},
    {id: "attr_num_cmt", name:"线上景点有评论数量", field: "attr_num_cmt", width: 160, formatter:trendFormatter},
    {id: "attr_img_per", name: "线上景点有图比例", field: "attr_img_per", width:150, formatter:trendFormatter},
    {id: "attr_num_total", name: "景点总数", field: "attr_num_total"},
//    {id: "attr_traf_per", name: "景点有交通比例", field: "attr_traf_per", width:120},
    {id: "attr_detail", name: "景点信息", field: "attr_detail", formatter:attrDetailFormatter},
    {id: "rest_num_online", name: "线上餐厅数量", field: "rest_num_online", width:120,formatter:trendFormatter},
    {id: "rest_num_cmt", name:"线上餐厅有评论数量", field: "rest_num_cmt", width: 160,formatter:trendFormatter},
    {id: "rest_img_per", name: "线上餐厅有图比例", field: "rest_img_per", width:150,formatter:trendFormatter},
    {id: "rest_num_total", name: "餐厅总数", field: "rest_num_total"},
//    {id: "rest_traf_per", name: "餐厅有交通比例", field: "rest_traf_per", width:120},
    {id: "rest_detail", name: "餐厅信息", field: "rest_detail", formatter:restDetailFormatter},
    {id: "shop_num_online", name: "线上购物数量", field: "shop_num_online", width:120,formatter:trendFormatter},
    {id: "shop_num_cmt", name:"线上购物有评论数量", field: "shop_num_cmt", width: 160,formatter:trendFormatter},
//    {id: "shop_traf_per", name: "购物有交通比例", field: "shop_traf_per", width:120},
    {id: "shop_img_per", name: "线上购物有图比例", field: "shop_img_per", width:150,formatter:trendFormatter},
    {id: "shop_num_total", name: "购物总数", field: "shop_num_total"},
    {id: "shop_detail", name: "购物信息", field: "shop_detail", formatter:shopDetailFormatter},
    {id: "hotel_num_online", name: "线上酒店数量", field: "hotel_num_online", width:120},
    {id: "hotel_num_cmt", name:"线上酒店有评论数量", field: "hotel_num_cmt", width: 160},
    {id: "hotel_img_per", name: "线上酒店有图比例", field: "hotel_img_per", width:150},
    {id: "hotel_num_total", name: "酒店总数", field: "hotel_num_total"}
//    {id: "hotel_traf_per", name: "酒店有交通比例", field: "hotel_traf_per", width:120},
//    {id: "hotel_detail", name: "酒店信息", field: "hotel_detail", formatter:hotelDetailFormatter},
//    {id: "bus_per", name: "公交占比", field: "bus_per"},
//    {id: "taxi_per", name: "打车占比", field: "taxi_per"},
//    {id: "walk_per", name: "步行占比", field: "walk_per"},
//    {id: "traf_detail", name: "交通详情", field: "traf_detail", formatter:trafDetailFormatter}
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

function trafDetailFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="city_traf.php?id='+value+'")">详情</a>';
}

function trendFormatter(row, cell, value, columnDef, dataContext) {
	return '<a href="show_trend.php?cid='+dataContext['cid']+'&cname='+dataContext['city']+'&col='+value[1]+'&type='+value[2]+'" target="_blank">'+value[0]+'</a>';
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
                tmp["景点有交通比例"] = sourceData[j].attr_num_total!='0'?(parseFloat(sourceData[j].view_traf)*100/parseFloat(sourceData[j].attr_num_total)).toFixed(2) + '%':'NaN';
				tmp["景点有图比例"] = sourceData[j].attr_num_total!='0'?(parseFloat(sourceData[j].attr_img)*100/parseFloat(sourceData[j].attr_num_online)).toFixed(2) + '%':'NaN';
                tmp["线上酒店数"] = sourceData[j].hotel_num_online;
            	tmp["有评论线上酒店"] = sourceData[j].hotel_num_cmt;
                tmp["酒店总数"] = sourceData[j].hotel_num_total;
                tmp["酒店有交通比例"] = sourceData[j].hotel_num_total!='0'?(parseFloat(sourceData[j].hotel_traf)*100/parseFloat(sourceData[j].hotel_num_total)).toFixed(2) + '%':'NaN';
                tmp["线上购物数"] = sourceData[j].shop_num_online;
                tmp["购物总数"] = sourceData[j].shop_num_total;
                tmp["购物有交通比例"] = sourceData[j].shop_num_total!='0'?(parseFloat(sourceData[j].shop_traf)*100/parseFloat(sourceData[j].shop_num_total)).toFixed(2) + '%':'NaN';
				tmp["购物有图比例"] = sourceData[j].shop_num_total!='0'?(parseFloat(sourceData[j].shop_img)*100/parseFloat(sourceData[j].shop_num_online)).toFixed(2) + '%':'NaN';
                tmp["线上餐厅数"] = sourceData[j].rest_num_online;
            	tmp["有评论线上餐厅"] = sourceData[j].rest_num_cmt;
                tmp["餐厅总数"] = sourceData[j].rest_num_total;
                tmp["餐厅有交通比例"] = sourceData[j].rest_num_total!='0'?(parseFloat(sourceData[j].rest_traf)*100/parseFloat(sourceData[j].rest_num_total)).toFixed(2) + '%':'NaN';
				tmp["餐厅有图比例"] = sourceData[j].rest_num_total!='0'?(parseFloat(sourceData[j].rest_img)*100/parseFloat(sourceData[j].rest_num_online)).toFixed(2) + '%':'NaN';
                break;
            }
        }
        data[i] = tmp;
    }
	console.log(data);
    $('<form action="ajax/ajax.php?action=city_info_export" method="POST" enctype="multipart/form-data">' +
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
            "attr_num_online":[line.attr_num_online,'online','attr'],
            "attr_num_cmt":[line.attr_num_cmt,'comment','attr'],
            "attr_num_total":line.attr_num_total,
//            "attr_traf_per":line.attr_num_total!='0'?(parseFloat(line.view_traf)*100/parseFloat(line.attr_num_total)).toFixed(2) + '%':'NaN',
            "attr_img_per":[line.attr_num_total!='0'?(parseFloat(line.attr_img)*100/parseFloat(line.attr_num_online)).toFixed(2) + '%':'NaN','image','attr'],
            "attr_detail":line.id,
            "hotel_num_online":line.hotel_num_online,
            "hotel_num_cmt":line.hotel_num_cmt,
            "hotel_num_total":line.hotel_num_total,
//            "hotel_traf_per":line.hotel_num_total!='0'?(parseFloat(line.hotel_traf)*100/parseFloat(line.hotel_num_total)).toFixed(2) + '%':'NaN',
            //"hotel_detail":"暂无数据",
//            "hotel_detail":line.id,
            "shop_num_online":[line.shop_num_online,'online','shop'],
            "shop_num_cmt":[line.shop_num_cmt,'comment','shop'],
            "shop_num_total":line.shop_num_total,
//            "shop_traf_per":line.shop_num_total!='0'?(parseFloat(line.shop_traf)*100/parseFloat(line.shop_num_total)).toFixed(2) + '%':'NaN',
            "shop_img_per":[line.shop_num_total!='0'?(parseFloat(line.shop_img)*100/parseFloat(line.shop_num_online)).toFixed(2) + '%':'NaN','image','shop'],
            "shop_detail":line.id,
            "rest_num_online":[line.rest_num_online,'online','rest'],
            "rest_num_cmt":[line.rest_num_cmt,'comment','rest'],
            "rest_num_total":line.rest_num_total,
//            "rest_traf_per":line.rest_num_total!='0'?(parseFloat(line.rest_traf)*100/parseFloat(line.rest_num_total)).toFixed(2) + '%':'NaN',
            "rest_img_per":[line.rest_num_total!='0'?(parseFloat(line.rest_img)*100/parseFloat(line.rest_num_online)).toFixed(2) + '%':'NaN','image','rest'],
            "hotel_img_per":line.hotel_num_total!='0'?(parseFloat(line.hotel_img)*100/parseFloat(line.hotel_num_online)).toFixed(2) + '%':'NaN',
            "rest_detail":line.id,
//            "bus_per":(parseFloat(line.bus_ratio)*100).toFixed(0) + '%',
//            "taxi_per":(parseFloat(line.car_ratio)*100).toFixed(0) + '%',
//            "walk_per":(parseFloat(line.walk_ratio)*100).toFixed(0) + '%',
//            "traf_detail":line.id
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
    console.log(cityName);
    var country = $('#country').val() != "" ? $('#country').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    //console.log(country);
	var continent = $('#continentList').val() || [];
    var status = $('#status').val();
    console.log(status);
    var city_type = $('#city_type').val();
    //console.log(city_type);
    var sortTag = $('#sortTag').val();
    //console.log(sortTag);
    var sortOrder = $('#sortOrder').val() == "positive" ? "" : "DESC";
    //console.log(sortOrder);

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=city_info",
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
            console.log("get here")
            if (data.status == 0) {
                makeTable(data.msg);
                console.log(data.msg);
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("aaaaaa服务器传输错误");
        }
    });
}

/* From Continent Info
 ----------------------------------*/
function showCity(cname) {
	console.log(cname);
	$('#continentList').multiselect('select', cname);
    doQuery();
}
