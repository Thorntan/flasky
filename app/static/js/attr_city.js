var sourceData;
var selectArray=[];
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
    checkboxSelector.getColumnDefinition(),
    {id: "id", name:"No.", field: "id", width:50},
    {id: "city_id", name: "城市ID", field: "city_id"},
    {id: "city", name: "城市名称", field: "city"},
    {id: "country", name: "国家", field: "country"},
    {id: "visit_num", name: "热度", field: "visit_num"},
    {id: "city_status", name: "上线状态", field: "city_status"},
	{id: "total", name:"景点总数", field:"total"},
	{id: "online_total", name: "上线景点数",field: "online_total", width:100},
	{id: "comment_total", name: "有评论景点数", field: "comment_total", width:100},
	{id: "image_total", name: "有图片景点数", field: "image_total", width:100},
	{id: "name_null", width:100 , name: "中文名空比例", field: "name_null", width:100 },
	{id: "name_bad", width:100 , name: "中文名格式错误率", field: "name_bad", width:100 },
	{id: "name_en_null", width:100 , name: "英文名空比例", field: "name_en_null", width:100 },
	{id: "name_en_bad", width:100 , name: "英文名格式错误率", field: "name_en_bad", width:100 },
	{id: "map_null", width:100 , name: "坐标空比例", field: "map_null", width:100 },
	{id: "address_null", width:100 , name: "地址空比例", field: "address_null", width:100 },
	{id: "open_null", width:100 , name: "开关门时间空比例", field: "open_null", width:100 },
	{id: "tag_null", width:100 , name: "tag空比例", field: "tag_null", width:100 },
	{id: "tag_en_null", width:100 , name: "tag_en空比例", field: "tag_en_null", width:100 },
	{id: "desc_null", width:100 , name: "描述空比例", field: "desc_null", width:100 },
	{id: "desc_bad", width:100 , name: "描述格式错误率", field: "desc_bad", width:100 },
	{id: "desc_en_null", width:100 , name: "英文描述空比例", field: "desc_en_null", width:100 },
	{id: "desc_en_bad", width:100 , name: "英文描述格式错误率", field: "desc_en_bad", width:100 }
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

// 注意sel这个属性是用于获取全选操作，必须要有，id属性也是silck.dataview必须要有的
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
            "city_id":line.id,
            "city":line.name,
            "country":line.country,
            "visit_num":line.visit_num,
            "city_status":line.city_status,
			"total":line.total,
			"online_total":line.online_total,
			"comment_total":line.comment_total,
			"image_total":line.image_total,
			"name_null":line.name_null,
			"name_bad":line.name_bad,
			"name_en_null":line.name_en_null,
			"name_en_bad":line.name_en_bad,
			"map_null":line.map_null,
			"address_null":line.address_null,
			"open_null":line.open_null,
			"tag_null":line.tag_null,
			"tag_en_null":line.tag_en_null,
			"desc_null":line.desc_null,
			"desc_bad":line.desc_bad,
			"desc_en_null":line.desc_en_null,
			"desc_en_bad":line.desc_en_bad
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
	
    $.ajax({
        type: "POST",
        url: "api/attr_city",
        dataType: "json",
        data: {
            "cityName":$('#cityName').val(),
            "countryName":$('#countryName').val(),
            "cityStatus":$('#cityStatus').val(),
            "sortTag":$('#sortTag').val(),
            "sortOrder":$('#sortOrder').val(),
			"isOnline":$('#isOnline').val(),
            "environment":$('#environment').val()
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

// 获取复选框选取的ID

// 导出数据到csv
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
        		    "city":sourceData[j].name,
        		    "country":sourceData[j].country,
        		    "visit_num":sourceData[j].visit_num,
        		    "city_status":sourceData[j].city_status,
					"total":sourceData[j].total,
					"online_total":sourceData[j].total,
					"comment_total":sourceData[j].comment_total,
					"image_total":sourceData[j].image_total,
					"name_null":sourceData[j].name_null,
					"name_en_null":sourceData[j].name_en_null,
					"map_null":sourceData[j].map_null,
					"address_null":sourceData[j].address_null,
					"open_null":sourceData[j].open_null,
					"tag_null":sourceData[j].tag_null,
					"tag_en_null":sourceData[j].tag_en_null,
					"desc_null":sourceData[j].desc_null
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
