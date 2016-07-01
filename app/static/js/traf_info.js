/**
 * Created by Timmy on 15/12/2.
 */

$(document).ready(function() {
    $('#noMsg').multiselect({
        nonSelectedText: '指定流程无信息',
        allSelectedText: '全选',
        nSelectedText: ' 项已选'
    });
} );
var sourceData=[];
var grid;
var selectArray=[];
var checkboxSelector = new Slick.CheckboxSelectColumn();
var columns = [
//    checkboxSelector.getColumnDefinition(),
//    {id: "id", name:"No.", field: "id", width:50},
    {id: "date", name: "日期", field: "date"},
    {id: "recall", name: "召回流程", field: "recall"},
    {id: "line_anno", name: "直线标注流程", field: "line_anno"},
    {id: "walk_pair", name: "步行pair流程", field: "walk_pair"},
    {id: "walk_extract", name: "步行抓取流程", field: "walk_extract"},
    {id: "walk_anno", name: "步行标注流程", field: "walk_anno"},
    {id: "made_traf", name: "自制交通流程", field: "made_traf"},
	{id: "index", name:"索引流程", field: "index"},	
];

var options = {
    enableAddRow:false,
    enableCellNavigation: true,
    enableColumnReorder: false,
    syncColumnCellResize: true,
    enableTextSelectionOnCells: true,
    editable: false,
	forceFitColumns: true
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

/* Query
 ----------------------------------*/
function makeTable(data) {
    sourceData = data;
    var newData = [];
    var cnt = 0;
	data.forEach(function(line) {
        var obj = {
            "date":line.date,
            "recall":[line.recall_start, line.recall_stop, line.recall_text],
            "line_anno":[line.line_start, line.line_stop, line.line_text],
            "walk_pair":[line.walk_pair_start, line.walk_pair_stop, line.walk_pair_text],
            "walk_extract":[line.walk_extract_start, line.walk_extract_stop, line.walk_extract_text],
            "walk_anno":[line.walk_anno_start, line.walk_anno_stop, line.walk_anno_text],
            "made_traf":[line.made_traf_start, line.made_traf_stop, line.made_traf_text],
            "index":[line.index_traf_start, line.index_traf_stop, line.index_traf_text]
        };
        newData.push(obj);
    });
    grid.invalidateAllRows();
    dataView.setItems(newData);
    grid.render();
}

function doQuery() {
    var date = $('#dateSearch').val() || "";
    var noMsg = $('#noMsg').val() || [];
    var year = $('#year').val() || "";
    var month = $('#month').val() || "";
    var sortTag = $('#sortTag').val();
    var sortOrder = $('#sortOrder').val() == "positive" ? "" : "DESC";

    $.ajax({
        type: "POST",
        url: "ajax/ajax.php?action=traf_info",
        dataType: "json",
        data: {
            date:date,
            noMsg:noMsg,
            year:year,
            month:month,
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

