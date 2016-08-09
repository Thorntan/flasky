/**
 * Created by Timmy on 15/11/18.
 */


var sourceData=[];
var selectArray=[];
var grid;
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
    checkboxSelector.getColumnDefinition(),
    {id: "id", name:"No.", field: "id", width:50},
    {id: "rest_id", name: "餐厅ID", field: "rest_id"},
    {id: "name", name: "餐厅中文名", field: "name" ,width:100},
    {id: "name_en", name: "餐厅英文名", field: "name_en" ,width:100},
    {id: "city", name: "城市", field: "city"},
    {id: "map", name: "坐标", field: "map"},
    {id: "address", name: "地址", field: "address"},
    {id: "open", name: "开关门", field: "open"},
    {id: "hot", name: "热度", field: "hot"},
    {id: "grade", name: "星级", field: "grade"},
    {id: "image_list", name: "图片", field: "image_list"},
	{id: "image_count", name:"图片数", field: "image_count"},
    {id: "cuisines", name: "菜系", field: "cuisines"},
    {id: "options", name: "options", field: "options"},
	{id: "tag", name: "Tag", field: "tag"},
    {id: "comment_count", name: "评论数", field: "comment_count"},
    {id: "data_source", name: "数据来源", field: "data_source"},
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
	//if (filterColumn.length == 24) {
	//    return '<a href="javascript:void(0)" onclick="edit(\''+ value +'\')">编辑</a>';
	//} else {
    //	return '编辑';
	//}
    return '编辑';
}

// 获取复选框选取的ID
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

//全选按钮
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

// 批量上线，批量下线
function batchOpt(option) {
	var optionStr = "";
	var idList = getSelectedArray();
	if (idList.length == 0) {
		alert("未选中行");
		return;
	}
	switch (option) {
		case 0:
			optionStr = "下线";
			break;
		case 1:
			optionStr = "上线";
			break;
	}
	if (confirm("确认将"+idList.length+"个餐厅状态改为"+optionStr+"吗？")) {
		var data = {
			idList: idList,
			option:option,
			environment:$('#environment').val(),
			category:"restaurant"
		};
		// 通过构造表单，提交post请求，并完成下载操作
    	$('<form action="change_online_status" method="POST" enctype="multipart/form-data">' +
    	'<textarea type="hidden" name="data">' + JSON.stringify(data) + '</textarea>' +
    	'</form>').submit();
	}
}

// 查询数据
function doQuery() {
    var sourceName = $('#sourceName').val();
    var matchMethod = $('input[name="matchMethod"]:checked').val();
    var sourceID = $('#sourceID').val();
    var cityName = $('#cityName').val();
	var countryName = $('#countryName').val();
    var isOnline = $('#isOnline').val();
    var dataSource = $('#dataSource').val();
    var sortTag = $('#sortTag').val();
    var sortOrder = $('#sortOrder').val();
	var limitNum = $('#limitNum').val();
	var environment = $('#environment').val();

    $.ajax({
        type: "POST",
        url: "api/rest_detail",
        dataType: "json",
        data: {
        	sourceName:sourceName,
			matchMethod:matchMethod,
			sourceID:sourceID,
			cityName:cityName,
			countryName:countryName,
			isOnline:isOnline,
			dataSource:dataSource,
			sortTag:sortTag,
			sortOrder:sortOrder,
			limitNum:limitNum,
			environment:environment
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

// 渲染表格
function makeTable(data) {
    sourceData = data;
    var newData = [];
    var cnt = 0;
    data.forEach(function(line) {
        var obj = {
            "checked":0,
            "id":++cnt,
			"sel":line.id,
            "rest_id":line.id,
            "name":line.name,
            "name_en":line.name_en,
            "city":line.city_name,
            "map":line.map_info,
            "address":line.address,
            "open":line.open_time,
            "cuisines":line.cuisines,
            "options":line.options,
			"hot":line.hot,
			"grade":line.grade,
            "image_list":line.image_list,
			"image_count":line.image_count,
            "tag":line.norm_tagid,
	    	"comment_count": line.comment_count,
            "data_source":line.source,
            "status":line.online==1?"线上":(line.online==2?"标注":"线下"),
            "edit":line.id
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

// 导出csv表格
$("#exportToCSV").click(function () {
    var idList = getSelectedArray();
	var postData = [];
	var i = idList.length;
	while(i--){
		var tmp = {};
		var j = sourceData.length;
		while(j--){
			if (idList[i] == sourceData[j].id) {
        		var obj = {
        		    "No.":j,
        		    "id":sourceData[j].id,
        		    "name":sourceData[j].name,
        		    "name_en":sourceData[j].name_en,
        		    "city":sourceData[j].city_name,
        		    "map":sourceData[j].map_info,
        		    "address":sourceData[j].address,
        		    "open":sourceData[j].open_time,
        		    "cuisines":sourceData[j].cuisines,
        		    "options":sourceData[j].options,
					"hot":sourceData[j].hot,
					"grade":sourceData[j].grade,
        		    "image_list":sourceData[j].image_list,
					"image_count":sourceData[j].image_count,
        		    "tag":sourceData[j].norm_tagid,
	    			"comment_count": sourceData[j].comment_count,
        		    "data_source":sourceData[j].source,
        		    "status":sourceData[j].online==1?"线上":(sourceData[j].online==2?"标注":"线下")
        		};
				postData.push(obj);
				break;
			}
		}
	}
    $('<form action="export" method="POST" enctype="multipart/form-data">' +
    '<textarea type="hidden" name="data">' + JSON.stringify(postData) + '</textarea>' +
    '</form>').submit();
});


