$(document).ready(function() {
    $('#labelField').multiselect({
        nonSelectedText: '选择标注字段',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });

    $('#annoWho').multiselect({
        nonSelectedText: '选择标注人',
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
//    {id: "cid", name: "城市ID", field: "cid"},
    {id: "country", name: "国家", field: "country"},
    {id: "taskName", name: "任务名称", field: "taskName",width: 150},
    {id: "labelField", name: "标注字段", field: "labelField", width:150},
    {id: "progress", name: "任务进度", field: "progress"},
    {id: "annoWho", name: "标注人", field: "annoWho", width: 150},
    {id: "checkWho", name: "check负责人", field: "checkWho", width: 100},
    {id: "checkStatus", name: "check状态/结论", field: "checkStatus", width: 120},
    {id: "syncStatus", name: "同步状态", field: "syncStatus"},
    {id: "taskAddr", name: "任务地址", field: "taskAddr", formatter:TaskAddressFormatter},
	{id: "deleteTask", name:"删除任务", field: "deleteTask", formatter:TaskDeleteFormatter},
    {id: "startTime", name: "任务生成时间", field: "startTime", width: 100},
    {id: "finishTime", name: "任务完成时间", field: "finishTime", width: 100},
    {id: "checkTime", name: "任务CK时间", field: "checkTime", width: 100},
    {id: "syncTime", name: "任务同步时间", field: "syncTime", width: 100},
    {id: "ddl", name: "Deadline", field: "ddl"}
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

function TaskAddressFormatter(row, cell, value, columnDef, dataContext) {
    return '<a href="'+value+'" target="_blank">打开</a>';
}

function TaskDeleteFormatter(row, cell, value, columnDef, dataContext) {
	return '<a href="javascript:void(0)" onclick="deleteTask(\''+ value +'\')">删除</a>';
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
				tmp["城市"] = sourceData[j].city==null?"混合城市":sourceData[j].city;
				tmp["国家"] = sourceData[j].country;
				tmp["任务名称"] = sourceData[j].name;
				tmp["标注字段"] = getFields(sourceData[j].fields);
				tmp["任务进度"] = sourceData[j].doneTask+'/'+sourceData[j].totalTask;
				tmp["标注人"] = sourceData[j].modifier;
				tmp["check负责任"] = sourceData[j].checkWho;
				tmp["check状态/结论"] = (sourceData[j].checked=="1"?"CK" : "未CK") + "/"  + (sourceData[j].checkRemark==""?"无评论" : sourceData[j].checkRemark);
				tmp["同步状态"] = sourceData[j].synState=="0"?"未同步" : "已同步";
				tmp["任务生成时间"] = sourceData[j].generTime;
				tmp["任务完成时间"] = sourceData[j].finish;
				tmp["任务CK时间"] = sourceData[j].checkTime;
				tmp["任务同步时间"] = sourceData[j].synTime;
				tmp["Deadline"] = sourceData[j].deadline;
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
            idList.push(curData[i].deleteTask);
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
function getFields(fields) {
    var fArray = fields.split("|");
    var fTnArray = [];
    var tmp = {
		'1':'景点名称',
		'2':'门票价格描述',
		'3':'游玩时长',
		'4':'开关门时间',
		'5':'景点包含关系功能暂未实现',
		'6':'景点图片',
		'7':'景点描述',
		'8':'景点归属'
    };
    for (var i = 0; i < fArray.length; ++i) {
        fTnArray.push(tmp[fArray[i]]);
    }
    return fTnArray.join("|");
}

function makeTable(data) {
    sourceData = data;
    var newData = [];
    var cnt = 0;
    data.forEach(function(line) {
        var obj = {
			"checked":0,
            "id":++cnt,
			"sel":cnt,
            "city":line.city==null?"混合城市":line.city,
            "cid":line.cid,
            "country":line.country,
            "taskName":line.name,
            "labelField":getFields(line.fields),
            "progress":line.doneTask+'/'+line.totalTask,
            "annoWho":line.modifier,
            "checkWho":line.checkWho,
            "checkStatus":(line.checked=="1"?"CK":"未CK") + "/"  + (line.checkRemark==""?"无评论":line.checkRemark),
            "syncStatus":line.synState=="0"?"未同步":"已同步",
            "taskAddr":"http://bi.mioji.com/markSystem/cityScenic/list/tid/"+line.tid,
			"deleteTask": line.tid,
            "startTime":line.generTime,
            "finishTime":line.finish,
            "checkTime":line.checkTime,
            "syncTime":line.synTime,
            "ddl":line.deadline
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
    var taskName = $('#taskName').val() || "";
    var matchFlag = $('input[name="taskMatch"]:checked').val();
    var sortTag = $('#sortTag').val();
    var sortOrder = $('#sortOrder').val();
	var isCheck = $('#isCheck').val();
	var isSync = $('#isSync').val();

	var cityName = $('#cityName').val();
	var labelField = $('#labelField').val();
	var annoWho = $('#annoWho').val();
	var checkWho = $('#checkWho').val();
	var taskID = $('#taskID').val();

    $.ajax({
        type: "POST",
        url: "attr_task_query",
        dataType: "json",
        data: {
            taskName:taskName,
            matchFlag:matchFlag,
            taskID:taskID,
            cityName:cityName,
            isCheck:isCheck,
            isSync:isSync,
            "labelField[]":labelField,
            "annoWho[]":annoWho,
            checkWho:checkWho,
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
            if (data.status == "success") {
                makeTable(data.result);
            } else {
                alert(data.status);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
}

/* Delete Task
 ----------------------------------*/
function deleteTask(tid) {
	if (confirm("确定删除该任务？")) {	
		$.ajax({
			type:"POST",
			async:true,
			method: "POST",
			//url: "http://10.10.167.111/Api/DeleteMarkTask",
			url: "attr_task_delete",
	        dataType:"json",
    	    data: {
  	    	    "tid[]":tid,
				"type":"2"
        	},
	        success: function(data) {
    	        if (data.status == 'success') {
					alert("删除任务成功！");
					// 删除成功后刷新页面
					window.location.reload();
 					//doQuery();
				} else {
					alert(data.status);
				}
	        },
    	    error: function(XMLHttpRequest, textStatus, errorThrown) {
        	   alert("服务器传输错误"+XMLHttpRequest+ textStatus+errorThrown);
	        }
	    });
	}
}

/* Batch Delete Tasks
 ----------------------------------*/
$("#batchDel").click(function() {
	var idList = getSelectedArray();
	if (idList.length == 0) {
		alert("未选中行");
		return;
	}
	if (confirm("确认要删除"+idList.length+"个任务吗？")) {
		$.ajax({
			type: "POST",
			url: "attr_task_delete",
			dataType: "json",
			data: {
				"tid[]":idList,
				"type":"2"
			},
        	success: function(data) {
    	        if (data.status == 'success') {
					alert("删除任务成功！");
					window.location.reload();
 					//doQuery();
				} else {
					alert(data.status);
					//location.reload(); 
				}
	        },
        	error: function(XMLHttpRequest, textStatus, errorThrown) {
            	alert("服务器传输错误");
	        }
		});
	}
});


/* From Attr Info
 ----------------------------------*/
function showAnno(name) {
    $("#cityName").val(name);
    doQuery();
}
