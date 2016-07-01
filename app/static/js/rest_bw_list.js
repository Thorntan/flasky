/**
 * Created by Timmy on 15/11/18.
 */

var viewName;
var matchFlag;
var viewID;
var cityName;
var country;
var continent;
var isOnline;
var whichList;
var dataSource;
var filterCanUse;
var filterCanNotUse;
var filterIsTag;
var filterIsNotTag;
var sortTag;
var sortOrder;
var topNum;

var sourceData=[];
var selectArray=[];
var grid;
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
    checkboxSelector.getColumnDefinition(),
    {id: "id", name:"No.", field: "id", width:50},
    //{id: "selectAll", name: "全选", field: "selectAll", formatter:Slick.Formatters.Checkmark, editor: Slick.Editors.Checkbox},
    {id: "v_id", name: "餐厅ID", field: "v_id"},
    {id: "name", name: "餐厅中文名", field: "name" ,width:100},
    {id: "name_en", name: "餐厅英文名", field: "name_en" ,width:100},
    {id: "city", name: "城市", field: "city"},
    {id: "map", name: "坐标", field: "map"},
    {id: "hot", name: "热度", field: "hot"},
    {id: "grade", name: "星级", field: "grade"},
    {id: "address", name: "地址", field: "address"},
    {id: "open", name: "开关门", field: "open"},
    {id: "image_list", name: "图片", field: "image_list"},
	{id: "image_num", name:"图片数", field: "image_num"},
    {id: "cuisines", name: "菜系", field: "cuisines"},
    {id: "options", name: "options", field: "options"},
    {id: "level", name: "level", field: "level"},
//    {id: "tag", name: "Tag", field: "tag"},
    {id: "cmt", name: "评论数", field: "cmt"},
    {id: "ddUrl", name: "道道Url", field: "ddUrl"},
    {id: "yelpUrl", name: "YelpUrl", field: "yelpUrl"},
    {id: "url", name: "官网Url", field: "url"},
    {id: "wikiUrl", name: "WikiUrl", field: "wikiUrl"},
    {id: "baiduUrl", name: "百度Url", field: "baiduUrl"},
    {id: "qyerUrl", name: "穷游Url", field: "qyerUrl"},
    {id: "mfwUrl", name: "马蜂窝Url", field: "mfwUrl" ,width:100},
    {id: "data_source", name: "数据来源", field: "data_source"},
    {id: "name_list", name: "所属名单", field: "name_list"},
    {id: "status", name: "状态", field: "status"},
    {id: "edit", name: "编辑", field: "edit", formatter: editFormatter}
];

var options = {
    enableAddRow:false,
    enableCellNavigation: true,
    enableColumnReorder: false,
    syncColumnCellResize: true,
    enableTextSelectionOnCells: true,
    //asyncEditorLoading: true,
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

function editFormatter(row, cell, value, columnDef, dataContext) {
	if (filterColumn.length == 24) {
	    return '<a href="javascript:void(0)" onclick="edit(\''+ value +'\')">编辑</a>';
	} else {
    	return '编辑';
	}
}

$(document).ready(function() {
    $('#whichList').multiselect({
        nonSelectedText: '选择名单',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#dataSource').multiselect({
        nonSelectedText: '选择数据来源',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#filterCanUse').multiselect({
        nonSelectedText: '选择可用条件',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#filterCanNotUse').multiselect({
        nonSelectedText: '选择不可用条件',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#filterIsTag').multiselect({
        nonSelectedText: '选择已标条件',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#filterIsNotTag').multiselect({
        nonSelectedText: '选择未标条件',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#fieldList').multiselect({
        nonSelectedText: '选择待标字段',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#operator').multiselect({
        nonSelectedText: '选择操作人',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#continentList').multiselect({
        nonSelectedText: '选择大洲',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#filterColumn').multiselect({
        nonSelectedText: '选择展示列',
        allSelectedText: '全选',
        nSelectedText: ' 项已选',
        includeSelectAllOption: true
    });
} );

function getSelectedArray() {
    var idList = [];
    var curData = dataView.getItems();
    for (var i = 0; i < curData.length; ++i) {
        if (curData[i].checked == 1) {
            idList.push(curData[i].v_id);
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

/* Add White
 ----------------------------------*/
function beforeAddWht() {
    $.ajax({
        url : 'ajax/ajax.php?action=rest_bw_list_getMaxID',
        type : 'POST',
        dataType: 'json',
        success : function(data) {
            if (data.status == 0) {
                $('#id_add').val(data.msg);
                clearAddModal();
                $('#addModal').modal('show');
            } else {
                alert(data.msg);
				console.log(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
}

function clearAddModal() {
	$('#name_add').val("");
	$('#name_en_add').val("");
	$('#city_id_add').val("");
	$('#map_info_add').val("");
	$('#real_ranking_add').val("");
	$('#open_add').val("<*><*><08:00-20:00><NULL>");
	$('#source_add').val("");
	$('#online_add').val("");

	$('#grade_add').val("");
	$('#cuisines_add').val("");
	$('#first_image_add').val("");
	$('#image_list_add').val("");
	$('#address_add').val("");
	$('#telephone_add').val("");
	$('#max_price_add').val("");
	$('#min_price_add').val("");
	$('#open_time_add').val("");
	$('#level_add').val("");
	$('#description_add').val("");
	$('#dining_options_add').val("");
}

$('#addBtn').click(function() {
	var id = $('#id_add').val() || "";
	var name = $('#name_add').val() || "";
	var name_en = $('#name_en_add').val() || "";
	var city_id = $('#city_id_add').val() || "";
	var map_info = $('#map_info_add').val() || "";
	var real_ranking = $('#real_ranking_add').val() || "";
	var source = $('#source_add').val() || "";
	var online = $('#online_add').val() || "";

	var grade = $('#grade_add').val() || 0;
	var cuisines = $('#cuisines_add').val() || "";
	var first_image = $('#first_image_add').val() || "";
	var image_list = $('#image_list_add').val() || "";
	var address = $('#address_add').val() || "";
	var telephone = $('#telephone_add').val() || "";
	var max_price = $('#max_price_add').val() || 0;
	var min_price = $('#min_price_add').val() || 0;
	var open_time = $('#open_time_add').val() || "";
	var level = $('#level_add').val() || 0;
	var description = $('#description_add').val() || "";
	var dining_options = $('#dining_options_add').val() || "";

    if (name == "" || name_en == "" || map_info == "" || city_id == "" || real_ranking == "" ||
        source == "" || online == "") {
        alert("请填写必填字段");
        return;
    }

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=rest_bw_list_addWhite",
        dataType: "json",
        data: {
			id:id,
			name:name,
			name_en:name_en,
			city_id:city_id,
			map_info:map_info,
			real_ranking:real_ranking,
			source:source,
			online:online,

			grade:grade,
			cuisines:cuisines,
			first_image:first_image,
			image_list:image_list,
			address:address,
			telephone:telephone,
			max_price:max_price,
			min_price:min_price,
			open_time:open_time,
			level:level,
			description:description,
			dining_options:dining_options
        },
        success: function(data) {
            if (data.status == 0) {
                alert(data.msg);
                $('#addModal').modal('hide');
                //doPureQuery();
            } else {
                alert(data.msg);
				console.log(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
});

/* Black List
 ----------------------------------*/

$('#addToBlack').click(function() {
    var idList = getSelectedArray();

    if (idList.length == 0) {
        alert("未选中行");
        return;
    }

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=rest_bw_list_addBlack",
        dataType: "json",
        data: {idList:idList},
        success: function(data) {
            if (data.status == 0) {
                alert(data.msg);
                doPureQuery();
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
});

$('#removeBlack').click(function() {
    var idList = getSelectedArray();

    if (idList.length == 0) {
        alert("未选中行");
        return;
    }

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=rest_bw_list_removeBlack",
        dataType: "json",
        data: {idList:idList},
        success: function(data) {
            if (data.status == 0) {
                alert(data.msg);
                doPureQuery();
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
});

/* Annotate
 ----------------------------------*/
function beforeAnno() {
    $("#task").val("");
    $('#operator').multiselect('deselectAll', false);
    $('#operator').multiselect('updateButtonText');
    $('#fieldList').multiselect('deselectAll', false);
    $('#fieldList').multiselect('updateButtonText');
    var idList = getSelectedArray();
    $("#ids").val(idList.join(','));
    $("#deadline").val("");
    $("#checkUser").val("");
	$("#checkPer").val("10");
	$("#checkNum").val("10");
	$("#ifMulti").val("0");
	$("#ifMultiCity").val("0");
    $("#AnnoModal").modal('show');
}

$("#annoBtn").click(function () {
    var task = $("#task").val() || "";
    var operator = $("#operator").val() || [];
    var items = $("#fieldList").val() || [];
    var ids = $("#ids").val() || "";
    var deadline = $("#deadline").val() || "";
    var checkUser = $("#checkUser").val() || "";
	var checkPer = $("#checkPer").val() || "";
	var checkNum = $("#checkNum").val() || "";
	var isMulti = parseInt($("#ifMulti").val());
	var isMultiCity = parseInt($("#ifMultiCity").val());
    var isTest = 0;

    if (task == "" || operator.length == 0 || items.length == 0 || ids == "" || deadline == "" || checkUser == "" || checkPer == "" || checkNum == "") {
        alert("请完整填写内容");
        return;
    }

	$.ajax({
		type: "POST",
		url: "ajax/ajax.php?action=rest_bw_list_anno",
		dataType: "json",
		data: {
			task:task,
			operator:operator.join('|'),
			items:items.join('|'),
			ids:ids,
			checkUser:checkUser,
			checkRate:checkPer,
			checkNum:checkNum,
			deadline:deadline,
			isTest:isTest,
			isMulti:isMulti,
			isMultiCity:isMultiCity
		},
		success: function(data) {
			if (data.status == 0) {
				alert(data.msg);
				$('#AnnoModal').modal('hide');
			} else {
				alert(data.msg);
				console.log(data.msg);
			}
		}
		});
});

/* Import1
 ----------------------------------*/

function beforeImport1() {
    $("#import1_upload").val("");
    $("#import1Modal").modal('show');
}

$("#import1Btn").click(function() {
    if ($('#import1_upload').val() == "") {
        alert("请上传文件");
        return;
    }

    var formData = new FormData();
    formData.append('file', $('#import1_upload')[0].files[0]);

    $.ajax({
        url : 'ajax/ajax.php?action=rest_bw_list_import1',
        type : 'POST',
        dataType: 'json',
        data : formData,
        processData: false,  // tell jQuery not to process the data
        contentType: false,  // tell jQuery not to set contentType
        beforeSend: function() {
            $("#import1Btn").innerHTML = "提交中";
            $("#import1Btn").removeClass("btn-primary");
            $("#import1Btn").addClass("btn-default");
            $("#import1Btn").prop("disabled","disable");
        },
        complete: function() {
            $("#import1Btn").innerHTML = "提交";
            $("#import1Btn").removeProp("disabled");
            $("#import1Btn").removeClass("btn-default");
            $("#import1Btn").addClass("btn-primary");
        },
        success : function(data) {
            if (data.status == 0) {
                alert(data.msg);
                $('#import1Modal').modal('hide');
            } else {
                alert(data.msg);
				console.log(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
});

/* Import2
 ----------------------------------*/
function beforeImport2() {
    $("#import2_upload").val("");
    $("input[name='importID']").each(function () {
        $(this).removeProp('checked');
    });
    $("#import_id").prop('checked','checked');

    $("#import2Modal").modal('show');
}

$("#import2Btn").click(function() {
    var columnList = [];
    $("input[name='importID']:checked").each(function(){
        columnList.push($(this).val());
    });
    if ($('#import2_upload').val() == "") {
        alert("请上传文件");
        return;
    }
    if (columnList.length == 1) {
        alert("请至少选择一项");
        return;
    }
    var formData = new FormData();
    formData.append('file', $('#import2_upload')[0].files[0]);
    formData.append('columnList', columnList);

    $.ajax({
        url : 'ajax/ajax.php?action=rest_bw_list_import2',
        type : 'POST',
        dataType: 'json',
        data : formData,
        processData: false,  // tell jQuery not to process the data
        contentType: false,  // tell jQuery not to set contentType
        success : function(data) {
            if (data.status == 0) {
                alert(data.msg);
                $('#import2Modal').modal('hide');
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
});

/* Edit Row
 ----------------------------------*/
function editRow(element, idName) {
    if ($(element).attr("checked")) {
        $('#'+idName).removeProp('disabled');
    } else {
        $('#'+idName).prop('disabled','disabled');
    }
}

function edit(id) {
    $("input[name='editID']").each(function () {
        $(this).removeProp('checked');
        $('#'+$(this).val()).prop('disabled','disabled');
    });
    var data = sourceData;
    //console.log(data);
    for (var i = 0; i < data.length; ++i) {
        if (data[i].id == id) {
			$('#v_id').val(data[i].id);
			$('#name').val(data[i].name);
			$('#name_en').val(data[i].name_en);
			$('#city_id').val(data[i].city_id);
			$('#map_info').val(data[i].map_info);
			$('#real_ranking').val(data[i].real_ranking);
			$('#grade').val(data[i].grade);
			$('#source').val(data[i].data_source);
			$('#online').val(data[i].online);
			$('#cuisines').val(data[i].cuisines);
			$('#first_image').val(data[i].first_image);
			$('#image_list').val(data[i].image_list);
			$('#address').val(data[i].address);
			$('#telphone').val(data[i].telphone);
			$('#max_price').val(data[i].max_price);
			$('#min_price').val(data[i].min_price);
			$('#open_time').val(data[i].open);
			$('#level').val(data[i].level);
			$('#description').val(data[i].description);
			$('#dining_options').val(data[i].options);
            $('#officialUrl').val(data[i].officialUrl);
            $('#wikiUrl').val(data[i].wikiUrl);
            $('#baiduUrl').val(data[i].baiduUrl);
            $('#qyerUrl').val(data[i].qyerUrl);
            $('#mafengwoUrl').val(data[i].mafengwoUrl);
            $('#daodaoUrl').val(data[i].daodaoUrl);
            $('#yelpUrl').val(data[i].yelpUrl);
            $('#editModal').modal('show');
            return;
        }
    }
}


$("#editBtn").click(function() {
	var v_id = $('#v_id').val();
	var name = $('#name').val();
	var name_en = $('#name_en').val();
	var city_id = $('#city_id').val();
	var map_info = $('#map_info').val();
	var real_ranking = $('#real_ranking').val();
	var grade = $('#grade').val();
	var source = $('#source').val();
	var online = $('#online').val();
	var cuisines = $('#cuisines').val();
	var first_image = $('#first_image').val();
	var image_list = $('#image_list').val();
	var address = $('#address').val();
	var telphone = $('#telphone').val();
	var max_price = $('#max_price').val();
	var min_price = $('#min_price').val();
	var open_time = $('#open_time').val();
	var level = $('#level').val();
	var description = $('#description').val();
	var dining_options = $('#dining_options').val();
	var officialUrl = $('#officialUrl').val();
	var wikiUrl = $('#wikiUrl').val();
	var baiduUrl = $('#baiduUrl').val();
	var qyerUrl = $('#qyerUrl').val();
	var mafengwoUrl = $('#mafengwoUrl').val();
	var daodaoUrl = $('#daodaoUrl').val();
	var yelpUrl = $('#yelpUrl').val();
    var editIdList = [];
    $("input[name='editID']:checked").each(function(){
        editIdList.push($(this).val());
    });

    if (editIdList.length == 0) {
        alert("请至少更新一项。");
        return;
    }

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=rest_bw_list_edit",
        dataType: "json",
        data: {
			v_id:v_id,
			name:name,
			name_en:name_en,
			city_id:city_id,
			map_info:map_info,
			real_ranking:real_ranking,
			grade:grade,
			source:source,
			online:online,
			cuisines:cuisines,
			first_image:first_image,
			image_list:image_list,
			address:address,
			telphone:telphone,
			max_price:max_price,
			min_price:min_price,
			open_time:open_time,
			level:level,
			description:description,
			dining_options:dining_options,
			officialUrl:officialUrl,
			wikiUrl:wikiUrl,
			baiduUrl:baiduUrl,
			qyerUrl:qyerUrl,
			mafengwoUrl:mafengwoUrl,
			daodaoUrl:daodaoUrl,
			yelpUrl:yelpUrl,
            editIdList:editIdList
        },
        success: function(data) {
            if (data.status == 0) {
                alert(data.msg);
                doPureQuery();
            } else {
                alert(data.msg);
				console.log(data.msg);
            }
            $('#editModal').modal('hide');
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
});

/* Batch Operation
 ----------------------------------*/
function batchOpt(opt) {
	var optStr = "";
	var idList = getSelectedArray();
	if (idList.length == 0) {
		alert("未选中行");
		return;
	}
	switch (opt) {
		case 0:
			optStr = "下线";
			break;
		case 1:
			optStr = "上线";
			break;
		case 2:
			optStr = "标注";
			break;
	}
	if (confirm("确认将"+idList.length+"个餐馆状态改为"+optStr+"吗？")) {
		$.ajax({
			type: "POST",
			url: "ajax/ajax.php?action=rest_bw_list_batch",
			dataType: "json",
			data: {
				idList: idList,
				opt:opt
			},
        	success: function(data) {
            	if (data.status == 0) {
                	alert(data.msg);
	                doPureQuery();
    	        } else {
        	        alert(data.msg);
            	}
    	    },
        	error: function(XMLHttpRequest, textStatus, errorThrown) {
            	alert("服务器传输错误");
	        }
		});
	}
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
                tmp["ID"] = sourceData[j].id;
                tmp["中文名"] = sourceData[j].name;
                tmp["英文名"] = sourceData[j].name_en;
                tmp["城市"] = sourceData[j].city;
                tmp["坐标"] = sourceData[j].map_info;
                tmp["热度"] = sourceData[j].hot;
                tmp["星级"] = sourceData[j].grade;
                tmp["地址"] = sourceData[j].address;
                tmp["开关门"] = sourceData[j].open;
                tmp["图片"] = sourceData[j].image_list;
				tmp["图片数"] = sourceData[j].image_list!=''&&sourceData[j].image_list!=null?sourceData[j].image_list.split('|').length:'0';
                tmp["菜系"] = sourceData[j].cuisines;
                tmp["options"] = sourceData[j].options;
                tmp["level"] = sourceData[j].level;
				tmp["评论数"] = sourceData[j].cmt;
                tmp["官网URL"] = sourceData[j].officialUrl;
                tmp["WikiURL"] = sourceData[j].wikiUrl;
                tmp["百度URL"] = sourceData[j].baiduUrl;
                tmp["穷游URL"] = sourceData[j].qyerUrl;
                tmp["马蜂窝URL"] = sourceData[j].mafengwoUrl;
                tmp["道道URL"] = sourceData[j].daodaoUrl;
                tmp["YelpURL"] = sourceData[j].yelpUrl;
                tmp["数据来源"] = sourceData[j].data_source;
                tmp["所属名单"] = sourceData[j].listName;
                break;
            }
        }
        data[i] = tmp;
    }
    $('<form action="ajax/ajax.php?action=rest_bw_list_export" method="POST" enctype="multipart/form-data">' +
    '<textarea type="hidden" name="data">' + JSON.stringify(data) + '</textarea>' +
    '</form>').submit();
});

/* Query
 ----------------------------------*/
function makeTable(data) {
    sourceData = data;
    var newData = [];
    var cnt = 0;
    data.forEach(function(line) {
        var obj = {
            //"selectAll":0,
            "checked":0,
            "sel":line.id,
            "id":++cnt,
            "v_id":line.id,
            "name":line.name,
            "name_en":line.name_en,
            "city":line.city,
            "map":line.map_info,
            "open":line.open,
            "address":line.address,
            "cuisines":line.cuisines,
            "options":line.options,
			"hot":line.hot,
			"grade":line.grade,
			"level":line.level,
            "image_list":line.image_list,
			"image_num":line.image_list!=''&&line.image_list!=null?line.image_list.split('|').length:'0',
            "tag":"暂无",
	    "cmt": line.cmt,
            "ddUrl":line.daodaoUrl,
            "yelpUrl":line.yelpUrl,
            "url":line.officialUrl,
            "wikiUrl":line.wikiUrl,
            "baiduUrl":line.baiduUrl,
            "qyerUrl":line.qyerUrl,
            "mfwUrl":line.mafengwoUrl,
            "data_source":line.data_source,
            "name_list":line.listName,
            "status":line.online==1?"线上":(line.online==2?"标注":"线下"),
            "edit":line.id
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
    viewName = $('#viewName').val() || "";
    matchFlag = $('input[name="cityMatch"]:checked').val();
    viewID = $('#viewID').val().replace(/，/g,',').replace(/ /g,'').split(',');
    cityName = $('#cityName').val().replace(/，/g,',').replace(/ /g,'').split(',');
	country = $('#country').val().replace(/，/g,',').replace(/ /g,'').split(',');
	continent = $('#continentList').val() || [];
    isOnline = $('#isOnline').val();
    whichList = $('#whichList').val() || [];
    dataSource = $('#dataSource').val() || [];
    filterCanUse = $('#filterCanUse').val() || [];
    filterCanNotUse = $('#filterCanNotUse').val() || [];
    filterIsTag = $('#filterIsTag').val() || [];
    filterIsNotTag = $('#filterIsNotTag').val() || [];
    sortTag = $('#sortTag').val();
    sortOrder = $('#sortOrder').val() == "positive" ? "" : "DESC";
    topNum = $('#topNum').val() || 'null';
    topHot = $('#topHot').val() || 'null';
    topHotPer = $('#topHotPer').val() || 'null';
	filterColumn = $('#filterColumn').val() || [];
	filterColumn.push("online");

    doPureQuery();
}

function doPureQuery() {
    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=rest_bw_list",
        dataType: "json",
        data: {
            viewName:viewName,
			matchFlag:matchFlag,
			viewID:viewID,
			cityName:cityName,
			country:country,
			continent:continent,
			isOnline:isOnline,
			whichList:whichList,
			dataSource:dataSource,
			filterCanUse:filterCanUse,
			filterCanNotUse:filterCanNotUse,
			filterIsTag:filterIsTag,
			filterIsNotTag:filterIsNotTag,
			sortTag:sortTag,
			sortOrder:sortOrder,
			topNum:topNum,
			topHot:topHot,
			topHotPer:topHotPer,
			filterColumn:filterColumn
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
                //console.log(data.msg);
            } else {
                alert(data.msg);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
}

/* From Attr Info
 ----------------------------------*/
function showAttr(name) {
    $("#cityName").val(name);
    doQuery();
}
