/**
 * Created by Timmy on 15/12/2.
 */

var category;
var sourceData=[];
var grid;
var selectArray=[];
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
    checkboxSelector.getColumnDefinition(),
    {id: "id", name:"No.", field: "id", width:50},
    {id: "poi_id", name:"ID", field: "poi_id", width:100},
    {id: "city_id", name: "城市ID", field: "city_id",width:100},
    {id: "city_name", name: "城市名称", field: "city_name",width:100},
    {id: "poi_name", name: "名称", field: "poi_name",width:150},
	{id: "img_num",name:"图片数",field:"img_num"},
	{id: "img_list",name:"图片",field:"img_list",width:300},
	{id: "edit", name: "图片重排", field: "edit", formatter: editFormatter}
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


/* Query
 ----------------------------------*/
function makeTable(data) {
    sourceData = data;
    var newData = [];
    var cnt = 0;
    data.forEach(function(line) {
	var img = line.img_list!="" ? line.img_list.replace(/ /g,'').split('|'):[];
        var obj = {
		"checked":0,
		"sel":line.id,
            	"id":++cnt,
            	"poi_id":line.id,
            	"poi_name":line.name,
            	"city_id":line.city_id,
            	"city_name":line.city_name,
		"img_num":img.length,
		"img_list":line.img_list,
		"edit":line.id
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function editFormatter(Formatterrow, cell, value, columnDef, dataContext) {
    return '<a href="javascript:void(0)" onclick="editPic(\''+ value +'\')">查看图片</a>';
}

function editPic(id) {
    console.log("editPic id: "+id);
	var mid = id;
	var img_list = '';
	var data = sourceData;
	for (var i=0; i<data.length;++i) {
		if (data[i].id == id) {
			//mid = data[i].poi_id;
			img_list = data[i].img_list;
		}
	}
	window.open("pic_edit.php?poi_id="+mid+"&category="+category);
	//$.ajax({
	//	type: "POST",
	//	url: "pic_edit.php",
	//	dataType: "json",
	//	data: {
	//		id:mid,
	//		img_list:img_list
	//	},
	//success: function(data) {
	//	window.open("pic_edit.php");
	//}
	//});	
}

function doQuery() {
    var poiID = $('#poiID').val() !="" ? $('#poiID').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    var poiName = $('#poiName').val() != "" ? $('#poiName').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    var cityID = $('#cityID').val() !="" ? $('#cityID').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
    var cityName = $('#cityName').val() != "" ? $('#cityName').val().replace(/，/g,',').replace(/ /g,'').split(',') : [];
	category = $('#whichCategory').val() !="" ? $('#whichCategory').val():'attr';
    console.log("category:"+category);

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=pic_list",
        dataType: "json",
        data: {
	    	poiID:poiID,
	    	poiName:poiName,
            cityID:cityID,
            cityName:cityName,
			category:category
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

function setPic(){
	alter("aaaaa");
}

//function showAttr(id) {
//    $("#poiID").val(id);
//    doQuery();
//}
