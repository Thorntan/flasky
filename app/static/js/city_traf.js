/**
 * Created by Timmy on 15/12/2.
 */

$(document).ready(function() {
    $('#receiver').multiselect({
        nonSelectedText: '请选择收件人',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });
} );

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
    {id: "visit_num", name: "热度", field: "visit_num"},
    {id: "status_date", name: "当前状态", field: "status_date", formatter:statusFormatter, width:120},
    {id: "traf_num_off", name: "交通线路数(off)", field: "traf_num_off", width: 120, formatter:offDetailFormatter},
    {id: "traf_num_on", name: "交通线路数(on)", field: "traf_num_on", width: 120, formatter:onDetailFormatter},
    {id: "line_recall_per", name: "直线召回率%", field: "line_recall_per", width: 150},
	{id: "line_perform", name:"直线效果(P/R/V)%", field: "line_perform", width: 200},	
	{id: "line_anno_addr", name:"直线标注地址", field: "line_anno_addr", width:120, formatter:lineAnnoFormatter},
	{id: "walk_recall_per", name: "步行数据覆盖率%", field: "walk_recall_per", width: 150},
    {id: "walk_perform", name: "步行效果(P/R/V)%", field: "walk_perform", width: 200},
    {id: "walk_anno_addr", name: "步行标注地址", field: "walk_anno_addr", width:150, formatter:walkAnnoFormatter},
    {id: "walk_num_pair", name: "步行pair数", field: "walk_num_pair"},
    {id: "traf_num_pair", name: "交通pair数", field: "traf_num_pair"},
    {id: "bus_cover_per", name: "公交覆盖率%", field: "bus_cover_per", width: 120},
    {id: "flow_info", name: "流程信息", field: "flow_info", formatter:flowFormatter},
    {id: "remark", name: "备注", field: "remark", formatter:remarkFormatter},
	{id: "checker", name: "负责人", field: "checker", width: 150}
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

function flowFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="">详情</a>';
}

function remarkFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="javascript:void(0)" onclick="sendRemark(\''+value[0]+'\',\''+value[1]+'\',\''+value[2]+'\')">编辑</a>';
}

function statusFormatter(row, cell, value, columnDef, dataContext) {
	if (value[2] == 17)
		return statusName[value[2]];
	else
		return '<a href="javascript:void(0)" onclick="nextStatus(\''+ value[0] +'\', \'' + value[1] + '\', ' + value[2] + ')">' + statusName[value[2]] + '</a>';
}

function lineAnnoFormatter(row, cell, value, columnDef, dataContext) {
	switch (value[0]) {
		case null:
			return "无";
			break;
		case "1":
		    return '<a href="javascript:void(0)" onclick=\'showAnno('+JSON.stringify(value[2])+',"'+value[1]+'")\'>'+value[1]+'</a>';
			break;
		default:
			break;
	}
	return "无";
}

function walkAnnoFormatter(row, cell, value, columnDef, dataContext) {
	switch (value[0]) {
		case null:
			return "无";
			break;
		case "1":
		    return '<a href="javascript:void(0)" onclick=\'showAnno('+JSON.stringify(value[2])+',"'+value[1]+'")\'>'+value[1]+'</a>';
			break;
		case "2":
		case "3":
		    return '<a href="javascript:void(0)" onclick=\'showAnno('+JSON.stringify(value[2])+',"'+value[1]+'")\'>'+value[1]+'(线)</a>/'+
				   '<a href="javascript:void(0)" onclick=\'showAnno('+JSON.stringify(value[4])+',"'+value[3]+'")\'>'+value[3]+'(步)</a>';
			break;
		default:
			break;
	}
	return "无";
}

function offDetailFormatter(row, cell, value, columnDef, dataContext) {
	return '<a href="http://123.59.79.9/traffic/offline/search.php?cid='+value[1]+'">'+value[0]+'</a>';
}

function onDetailFormatter(row, cell, value, columnDef, dataContext) {
	return '<a href="http://123.59.79.9/traffic/online/search.php?cid='+value[1]+'">'+value[0]+'</a>';
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
				tmp["热度"] = sourceData[j].visit_num;
				tmp["当前状态"] = statusName[sourceData[j].flow_status];
				tmp["交通线路数(off)"] = sourceData[j].traf_num_off;
				tmp["交通线路数(on)"] = sourceData[j].traf_num_on;
				tmp["直线召回率%"] = sourceData[j].line_recall==null?'无':sourceData[j].line_recall + '/' + sourceData[j].line_recall_date;
				tmp["直线效果(P/R/V)%"] = (sourceData[j].line_perform==null?'无':sourceData[j].line_perform) + '/' + (sourceData[j].line_perform_date==null?'无':sourceData[j].line_perform_date);
				tmp["步行数据覆盖率"] = sourceData[j].walk_cover==null?'无':sourceData[j].walk_cover + '/' + sourceData[j].walk_cover_date;
				tmp["步行效果(P/R/V)%"] = (sourceData[j].walk_perform==null?'无':sourceData[j].walk_perform) + '/' + (sourceData[j].walk_perform_date==null?'无':sourceData[j].walk_perform_date);
				tmp["步行pair数"] = sourceData[j].walk_pair==null?'无':sourceData[j].walk_pair;
				tmp["交通pair数"] = sourceData[j].traf_pair==null?'无':sourceData[j].traf_pair;
				tmp["公交覆盖率%"] = sourceData[j].total_cover + '/' + sourceData[j].g_cover + '/' + sourceData[j].z_cover;
                break;
            }
        }
        data[i] = tmp;
    }
	console.log(data);
    $('<form action="ajax/ajax.php?action=city_traf_export" method="POST" enctype="multipart/form-data">' +
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

/* 状态转移
 ----------------------------------*/
var statusName = ["未启动","线路入库","待确认线路","待跑召回","待优化召回","待跑直线标注","待直线标注","待分析直线效果","直线已check","直线OK","待抓步行数据","待跑步行标注","待步行标注","待分析步行效果", "步行已check","步行OK", "待上线","已上线"];

var statusMove = {
	"0":[{
		"1":"确认开始"
	}],
	"1":[{
		"2":"确认OK"
	}],
	"2":[{
		"3":"确认OK"
	},
	{
		"1":"线路有问题"
	}],
	"3":[{
		"4":"确认OK"
	}],
	"4":[{
		"5":"召回达到90%，进入直线标注"
	},
	{
		"10":"召回达到90%，进入步行标注"
	},
	{
		"1":"线路有问题"
	},
	{
		"3":"脚本问题"
	}],
	"5":[{
		"6":"确认OK"
	}],
	"6":[{
		"7":"确认OK"
	}],
	"7":[{
		"8":"确认OK"
	},
	{
		"1":"线路有问题"
	},
	{
		"5":"规划效果有问题"
	}],
	"8":[{
		"9":"确认OK"
	}],
	"9":[{
		"10":"确认OK"
	}],
	"10":[{
		"11":"确认OK"
	}],
	"11":[{
		"12":"确认OK"
	}],
	"12":[{
		"13":"确认OK"
	}],
	"13":[{
		"14":"确认OK"
	},
	{
		"10":"缺步行"
	},
	{
		"11":"规划效果有问题"
	}],
	"14":[{
		"15":"确认OK"
	}],
	"15":[{
		"16":"确认OK"
	}],
	"16":[{
		"17":"确认OK，上线"
	}]
};

function nextStatus(cid, cname, statusid) {
	$("#city_id").val(cid);
	$("#city_name").val(cname);
	$("#status_cur").val(statusName[statusid]);
	$("#status_next").val(statusName[statusid+1]);
	var selOpt = $("#action option");
	selOpt.remove();
	selOpt = $("#action");
	var statusArray = statusMove[statusid];
	$.each(statusArray, function(index, content) {
		$.each(content, function(value, name) {
			selOpt.append("<option value='"+value+"'>"+name+"</option>");
		});
	});
	$("#is_anno").val(0);
	$("#is_anno_delete").val(0);
	$("#new_anno_line").hide();
	$("#new_anno_walk").hide();
	switch (statusid) {
		case 4:
			$("#is_anno").val(1);
			$("#new_anno_line").show();
			break;
		case 9:
			$("#is_anno").val(2);
			$("#new_anno_walk").show();
			break;
		case 8:
			$("#is_anno_delete").val(1);
			break;
		case 14:
			$("#is_anno_delete").val(2);
			break;
		default:
			break;
	}
    $.ajax({
        url : 'ajax/ajax.php?action=city_traf_getSlot',
        type : 'POST',
        dataType: 'json',
        success : function(data) {
            if (data.status == 0) {
				var line_slot_c = $("#line_slot_c");
				line_slot_c.empty();
				var walk_slot_c = $("#walk_slot_c");
				walk_slot_c.empty();
				var walk_slot_d = $("#walk_slot_d");
				walk_slot_d.empty();
                $.each(data.msg['c'], function(key, value) {
					line_slot_c.append("<option value='"+key+"'>"+value+"</option>");
					walk_slot_c.append("<option value='"+key+"'>"+value+"</option>");
				});
				$.each(data.msg['d'], function(key, value) {
					walk_slot_d.append("<option value='"+key+"'>"+value+"</option>");
				});
                $('#statusModal').modal('show');
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
}

$("#action").change(function() {
	$("#status_next").val(statusName[$(this).val()]);
	switch ($(this).val()) {
		case '5':
			$("#is_anno").val(1);
			$("#new_anno_walk").hide();
			$("#new_anno_line").show();
			break;
		case '10':
			$("#is_anno").val(2);
			$("#new_anno_line").hide();
			$("#new_anno_walk").show();
			break;
		default:
			$("#is_anno").val(0);
			$("#new_anno_line").hide();
			$("#new_anno_walk").hide();
			break;
	}
});

$("#walk_anno_type").change(function() {
	switch ($(this).val()) {
		case '1':
			$("#walk_d").hide();
			$("#walk_c").show();
			break;
		case '2':
			$("#walk_d").show();
			$("#walk_c").show();
			break;
		case '3':
			$("#walk_d").show();
			$("#walk_c").hide();
			break;
	}
});

function showAnno(urls, title) {
	$("#url_title").text(title+'槽链接');
	var Opt = $("#urls");
	Opt.empty();
	$.each(urls, function(idx, obj) {
		Opt.append('<a href="'+obj['url']+'" target="_blank">'+obj['name']+'</a><br>');
	});
	$("#annoModal").modal('show');
}

$("#statusBtn").click(function() {
	var city_id = $("#city_id").val();
	var status_next_id = $("#action").val();
	var status_next_name = statusName[status_next_id];
	var is_anno = $("#is_anno").val();
	var is_anno_delete = $("#is_anno_delete").val();
	var line_anno_type = $("#line_anno_type").val();
	var line_slot_c = $("#line_slot_c").val();
	var walk_anno_type = $("#walk_anno_type").val();
	var walk_slot_d = $("#walk_slot_d").val();
	var walk_slot_c = $("#walk_slot_c").val();
    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=city_traf_status",
        dataType: "json",
        data: {
            cityID:city_id,
            status_id:status_next_id,
            status_name:status_next_name,
			is_anno:is_anno,
			is_anno_delete:is_anno_delete,
			line_anno_type:line_anno_type,
			line_slot_c:line_slot_c,
			walk_anno_type:walk_anno_type,
			walk_slot_d:walk_slot_d,
			walk_slot_c:walk_slot_c
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
				alert(data.msg);
				$("#statusModal").modal('hide');
				doQuery();
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
});

/* 发送备注 
 ----------------------------------*/
function sendRemark(cityid, status_remark, checker) {
	$("#cityid").val(cityid);
	$("#sender").val("gaoxin@mioji.com");
	$("#passwd").val("");
    $('#receiver').multiselect('deselectAll', false);
    $('#receiver').multiselect('updateButtonText');
	$("#remark").val(status_remark=='null'?"":status_remark);
	$("#title").val("");
	$("#remarkModal").modal('show');
}

$("#remarkBtn").click(function() {
	var cityid = $("#cityid").val();
	var sender = $("#sender").val();
	var senderName = $("#sender option:selected").text();
	var passwd = $("#passwd").val() || "";
	var receiver = $("#receiver").val() || [];
	var receiverName = $("#receiver option:selected").map(function(){return $(this).text();}).get().join(';');
	var title = $("#title").val();
	var remark = $("#remark").val() || "";

	if (passwd == "" || receiver.length == 0 || title == "" || remark == "") {
		alert("请完整填写内容");
		return;
	}
/*	console.log(sender);
	console.log(senderName);
	console.log(receiver);
	console.log(receiverName);
	return;*/
	$.ajax({
		type: "POST",
		url: "ajax/ajax.php?action=city_traf_sendRemark",
		dataType: "json",
		data: {
			cityid: cityid,
			sender: sender,
			senderName: senderName,
			passwd: passwd,
			receiver: receiver,
			receiverName: receiverName,
			title: title,
			remark: remark
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
				alert(data.msg);
				$("#remarkModal").modal('hide');
				doQuery();
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
	});
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
            "visit_num":line.visit_num,
            "status_date":[line.id, line.name, line.flow_status],//日期从表里取？
            "traf_num_off":[line.traf_num_off,line.id],
            "traf_num_on":[line.traf_num_on,line.id],
            "line_recall_per":line.line_recall==null?'无':line.line_recall + '/' + line.line_recall_date,
			"line_perform":(line.line_perform==null?'无':line.line_perform) + '/' + (line.line_perform_date==null?'无':line.line_perform_date),
			"line_anno_addr":[line.line_anno_type,line.line_slot_c,line.line_slot_c_url],
			"walk_recall_per":line.walk_cover==null?'无':line.walk_cover + '/' + line.walk_cover_date,
            "walk_perform":(line.walk_perform==null?'无':line.walk_perform) + '/' + (line.walk_perform_date==null?'无':line.walk_perform_date),
			"walk_anno_addr":[line.walk_anno_type,line.walk_slot_c,line.walk_slot_c_url,line.walk_slot_d,line.walk_slot_d_url],
			"walk_num_pair":line.walk_pair==null?'无':line.walk_pair,
			"traf_num_pair":line.traf_pair==null?'无':line.traf_pair,
			"bus_cover_per":line.total_cover + '/' + line.g_cover + '/' + line.z_cover,
			"flow_info":'',
			"remark":[line.id, line.status_remark, line.checker],
			"checker":line.checker==null?"无":line.checker
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
    //console.log(status);
    var city_type = $('#city_type').val();
    //console.log(city_type);
    var sortTag = $('#sortTag').val();
    //console.log(sortTag);
    var sortOrder = $('#sortOrder').val() == "positive" ? "" : "DESC";
    //console.log(sortOrder);

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=city_traf",
        dataType: "json",
        data: {
            cityID:cityID,
            cityName:cityName,
            country:country,
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
